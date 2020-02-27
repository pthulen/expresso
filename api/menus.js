const express = require('express');
const menusRouter = express.Router();
const sqlite3 = require('sqlite3');

//loads database and uses Test Database during tests rather than working database
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//GET all handler for current menu
menusRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Menu', (err, menus) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({menus: menus});
      }
    });
  });

//parameter handler for all request using menu Id
menusRouter.param('menuId', (req, res, next, menuId) => {
    db.get("SELECT * FROM Menu WHERE Menu.id = $Id", 
    {
      $Id: menuId  
    }, (err, menu) => {
        if(err) {
            next(err);
        } else if (menu) {
                req.menu = menu;
                next();
            } else {
                res.status(404);
                
            }
    })
  });  

  //Handles GET requests by menu id
menusRouter.get('/:menuId',(req,res, next) => {
    res.status(200).json({menu: req.menu});
})

//Handles POST request 
menusRouter.post('/', (req, res, next) => {
    //checks if the req is valid
    const title = req.body.menu.title;
    if(!title) {
        return res.sendStatus(400);
    }

    const sql = `INSERT INTO Menu (title) 
    VALUES ($title)`;
    const values = {
        $title: title
    }

    db.run(sql, values, function(err) {
        if(err) {
            next(err);
        } else {
        db.get("SELECT * FROM Menu WHERE Menu.id = $lastID", 
        {
            $lastID: this.lastID
        }, (err, menu) => {
            res.status(201).json({menu: menu});
        })
    }
    }) 
});

module.exports = menusRouter;