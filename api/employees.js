const express = require('express');
const employeesRouter = express.Router();
const sqlite3 = require('sqlite3');

//loads database and uses Test Database during tests rather than working database
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//GET all handler for current employees
employeesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Employee WHERE is_current_employee = 1', (err, employees) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({employees: employees});
      }
    });
  });

//parameter handler for all request using employee Id
employeesRouter.param('id', (req, res, next, id) => {
    db.get("SELECT * FROM Employee WHERE Employee.id = $Id", 
    {
      $Id: id  
    }, (err, employee) => {
        if(err) {
            next(err);
        } else if (employee) {
                req.employee = employee;
                next();
            } else {
                res.status(404);
                
            }
    })
  });  

  //Handles GET requests by employee id
employeesRouter.get('/:id',(req,res, next) => {
    res.status(200).json({employee: req.employee});
})

//Handles POST request 
employeesRouter.post('/', (req, res, next) => {
    //checks if the req is valid
    const name = req.body.employee.name;
    const position =req.body.employee.position;
    const wage = req.body.employee.wage
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    if(!name || !position || !wage) {
        return res.sendStatus(400);
    }

    const sql = `INSERT INTO Employee (name, position, wage, is_current_employee) 
    VALUES ($name, $position, $wage, $isCurrentEmployee)`;
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee
    }

    db.run(sql, values, function(err) {
        if(err) {
            next(err);
        } else {
        db.get("SELECT * FROM Employee WHERE Employee.id = $lastID", 
        {
            $lastID: this.lastID
        }, (err, employee) => {
            res.status(201).json({employee: employee});
        })
    }
    }) 
});

//handles PUT requests
employeesRouter.put('/:id', (req, res, next) => {
    //checks if the req is valid
    const name = req.body.employee.name;
    const position =req.body.employee.position;
    const wage = req.body.employee.wage
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    if(!name || !position || !wage) {
        return res.sendStatus(400);
    }

    //query string
    const sql = 'UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE Employee.id = $id';
    //values in string from PUT request
    const values = {
    $name: name,
    $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee,
    $id: req.params.id
    };

    db.run(sql, values, (error) => {
        if(error) {
            next(error);
        } else {
        db.get("SELECT * FROM Employee WHERE Employee.id = $employeeId", 
        {
            $employeeId: req.params.id
        }, (error, employee) => {
            res.status(200).json({employee: employee});
        })
    }
    });
});

employeesRouter.delete('/:id', (req, res, next) => {
    const employeeId = req.params.id;
    const isCurrentlyEmployed = 0;
    const sql = 'UPDATE Employee SET is_current_employee = $isCurrentlyEmployed WHERE Employee.id = $employeeId';
    const values = {
        $isCurrentlyEmployed: isCurrentlyEmployed,
        $employeeId: employeeId
    };

    db.run(sql, values, (error) => {
        if(error) {
            next(error);
        } else {
            db.get("SELECT * FROM Employee WHERE Employee.id = $employeeId", 
            {
                $employeeId: req.params.id
            }, (error, employee) => {
                res.status(200).json({employee: employee});
            })
    }
    });
}); 

module.exports = employeesRouter;