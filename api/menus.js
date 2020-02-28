const express = require('express');
const menusRouter = express.Router();
const sqlite3 = require('sqlite3');

//loads database and uses Test Database during tests rather than working database
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemsRouter = require('./menuItems');

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

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

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


menusRouter.put('/:menuId', (req, res, next) => {
    const title = req.body.menu.title;
    if (!title) {
      return res.sendStatus(400);
    }
  
    const sql = 'UPDATE Menu SET title = $title WHERE Menu.id = $menuId';
    const values = {
      $title: title,
      $menuId: req.params.menuId
    };
  
    db.run(sql, values, (error) => {
      if (error) {
        next(error);
      } else {
        db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`,
          (error, menu) => {
            res.status(200).json({menu: menu});
          });
      }
    });
  });
  
  menusRouter.delete('/:menuId', (req, res, next) => {
    const menuItemSql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
    const menuItemValues = {$menuId: req.params.menuId};
    db.get(menuItemSql, menuItemValues, (error, menuItem) => {
      if (error) {
        next(error);
      } else if (menuItem) {
        return res.sendStatus(400);
      } else {
        const deleteSql = 'DELETE FROM Menu WHERE Menu.id = $menuId';
        const deleteValues = {$menuId: req.params.menuId};
  
        db.run(deleteSql, deleteValues, (error) => {
          if (error) {
            next(error);
          } else {
            res.sendStatus(204);
          }
        });
  
      }
    });
  });

module.exports = menusRouter;