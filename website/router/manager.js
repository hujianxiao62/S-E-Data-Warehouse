//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mySQL = require("mysql");
const queryString = require('query-string');
const alert = require('alert-node');
const mailFormat = /\S+@\S+\.\S+/;

const router = express.Router();
const dbConnect = mySQL.createConnection({
  host: 'localhost',
  user: 'gatechUser',
  password: 'gatech123',
  database: 'cs6400_team024',
  multipleStatements: true
});


router.get("/editManager", function(req, res) {
  res.render("editManager", {
    mngR: []
  });
});

router.post("/editManager", function(req, res) {
  res.render("editManager", {
    mngR: []
  });
});

router.post("/searchManager", function(req, res) {
  const post = {
    mngName: req.body.managerName,
    mngEm: req.body.managerEmail,
    mngStrNum: req.body.managerStoreNum,
  };
  var dbQ1 = '';
  var dbQ2 = '';
  var dbQ3 = '';
  // *******************************************************************************
  // Manager Information Input Validation
  if (post.mngEm !== '') {
    if (!(mailFormat.test(post.mngEm))) {
      alert("Please enter a valid email address!")
    }
  }
  // *******************************************************************************
  if (post.mngEm !== '') {
    dbQ1 = "email = \'" + post.mngEm + "\' AND ";
  }
  if (post.mngName !== '') {
    dbQ2 = "manager_name LIKE \'%" + post.mngName + "%\' AND ";
  }
  if (post.mngStrNum !== '') {
    dbQ3 = "store_number = \'" + post.mngStrNum + "\'";
  } else {
    dbQ3 = "storeIDZ >= 0"
  }
  // dbQ returns table(email, manager_name, storeID) of all managers, in which the storeID for inactivemanager is 0;
  var dbQ = "SELECT * FROM (SELECT * FROM (SELECT * FROM ((SELECT email, manager_name, storeID AS storeIDZ FROM (activeManager NATURAL JOIN manage)) UNION ALL " +
    "(SELECT email, manager_name, 0 AS storeID FROM inactivemanager)) AS M) AS A LEFT JOIN store on A.storeIDZ = store.storeID) AS R WHERE " +
    dbQ1 + dbQ2 + dbQ3 +
    ";";

  console.log('editManager SQL: ' + dbQ);
  dbConnect.query(dbQ, function(error, rows, fields) {
    if (!!error) {
      console.log('ERROR: editManager SQL');
      console.log(error);
    } else {
      console.log(rows);
      res.render("editManager", {
        mngR: rows
      });
    }
  });
});

router.post("/addManager", function(req, res){
  const post =
  {
    mngName: req.body.managerName,
    mngEm: req.body.managerEmail,
  };
  if (post.mngEm == '' || post.mngName == ''){
    alert("ERROR: Please enter name and email!");
    // *******************************************************************************
    // Redirecting to Edit Manger Home Page
    setTimeout(function() {
        return res.redirect('/editManager');
      }, 400);
  }
  else if (!(mailFormat.test(post.mngEm))){
      // *******************************************************************************
      // Manager Information Input Validation and redirect to Edit Manager Home Page
      alert("Please enter a valid email address!");
      setTimeout(function() {
        return res.redirect('/editManager');
      }, 400);
   }
  else {
    var dbCheckMngExist = 'SELECT * FROM activemanager WHERE email = \'' + post.mngEm + '\' UNION ALL SELECT * FROM inactiveManager WHERE email = \'' + post.mngEm + '\';';
    var dbAddMng = 'INSERT INTO inactivemanager(email, manager_name) VALUES(\'' + post.mngEm + '\',\'' + post.mngName + '\');';
    dbConnect.query(dbCheckMngExist, function(error, rows, fields)
    {
      if (rows.length !== 0) {
        alert("ERROR: Manager already exists!");
        // *******************************************************************************
        // Redirecting to Edit Manger Home Page
        setTimeout(function() {
          return res.redirect('/editManager');
        }, 400);
      }
      else
        {
          dbConnect.query(dbAddMng, function(error, rows, fields)
          {
            alert("Added Succeefully!");
            // *******************************************************************************
            // Redirecting to Edit Manger Home Page
            setTimeout(function() {
              return res.redirect('/editManager');
            }, 400);
          })
        }
      });
    }
});

router.post("/removeManager", function(req, res) {
  const post = {
    mngEm: req.body.managerEmail,
  };
  if (post.mngEm == '') {
    alert("ERROR: Please enter email!");
    // *******************************************************************************
    // Redirecting to Edit Manger Home Page
    setTimeout(function() {
      return res.redirect('/editManager');
    }, 400);
  } else {
    // *******************************************************************************
    // Manager Information Input Validation and redirect to Edit Manager Home Page
    if (!(mailFormat.test(post.mngEm))) {
      alert("Please enter a valid email address!");
      setTimeout(function() {
        return res.redirect('/editManager');
      }, 400);
    }else{
      var dbCheckMngExist = 'SELECT * FROM activemanager WHERE email = \'' + post.mngEm + '\' UNION ALL SELECT * FROM inactiveManager WHERE email = \'' + post.mngEm + '\';';
      var dbCheckMngActive = 'SELECT * FROM activemanager WHERE email = \'' + post.mngEm + '\';';
      var dbDeleteMng = 'DELETE FROM inactivemanager WHERE email = \'' + post.mngEm + '\';';
      dbConnect.query(dbCheckMngExist, function(error, rows, fields) {
        if (rows.length == 0) {
          alert("ERROR: Manager does not already exist!");
          // *******************************************************************************
          // Redirecting to Edit Manger Home Page
          setTimeout(function() {
            return res.redirect('/editManager');
          }, 400);
        } else {
          dbConnect.query(dbCheckMngActive, function(error, rows, fields) {
            if (rows.length !== 0) {
              alert("ERROR: Manager is active, please unassign first!");
              // *******************************************************************************
              // Redirecting to Edit Manger Home Page
              setTimeout(function() {
                return res.redirect('/editManager');
              }, 400);
            } else {
              dbConnect.query(dbDeleteMng, function(error, rows, fields) {
                alert("Removed Succeefully!");
                // *******************************************************************************
                // Redirecting to Edit Manger Home Page
                setTimeout(function() {
                  return res.redirect('/editManager');
                }, 400);
              })
            }
          })
        }
      })
    }
  }
});

router.post("/assignManager", function(req, res) {
  const post = {
    mngStrNum: req.body.managerStoreNum,
    mngEm: queryString.parse(req.headers.referer).email,
  };
  console.log("qqqqqqqqqqqqqqqqqqqqqqqqqqqqq");
  console.log(post);
  var dbCheckStrExist = 'SELECT * FROM store WHERE storeID = \'' + post.mngStrNum + '\';';
  var dbSignMng = "WITH CTE_Manager AS (SELECT activeManagerID AS managerID, email FROM activemanager UNION SELECT inactiveManagerID AS managerID, email FROM inactivemanager)" +
    "SELECT @managerid:= ManagerID FROM CTE_Manager where email = \'" + post.mngEm + "\'; SELECT @storeid:= storeID from store where store_number = " + post.mngStrNum + "; INSERT INTO manage SELECT @storeid,@managerid;";

  if (post.mngStrNum == '') {
    alert("ERROR: Please enter store number!");
    // *******************************************************************************
    // Redirecting to Edit Manger Home Page
    setTimeout(function() {
      return res.redirect('/editManager');
    }, 400);
  } else {
    dbConnect.query(dbCheckStrExist, function(error, rows, fields) {
      if (rows.length == 0) {
        alert("ERROR: Store does not exist!");
        // *******************************************************************************
        // Redirecting to Edit Manger Home Page
        setTimeout(function() {
          return res.redirect('/editManager');
        }, 400);
      } else {
        dbConnect.query(dbSignMng, function(error, rows, fields) {
          alert("Assigned Succeefully!");
          // *******************************************************************************
          // Redirecting to Edit Manger Home Page
          setTimeout(function() {
            return res.redirect('/editManager');
          }, 400);
        })
      }
    });
  }
});

router.post("/unassignManager", function(req, res) {
  const post = {
    mngStrNum: req.body.managerStoreNum,
    mngEm: queryString.parse(req.headers.referer).email,
  };

  var dbCheckStrExist = 'SELECT * FROM store WHERE storeID = \'' + post.mngStrNum + '\';';
  var dbCheckMngStore = "select @var_name:= activeManagerID from activemanager  where email = \'" + post.mngEm + "\';" +
                   "SELECT @storeid:= storeID from store where store_number = \'" + post.mngStrNum  + "\';" +
    "select * from manage where storeid = @storeid and activeManagerID = @var_name;";
  var dbUnsignMng = "select @var_name:= activeManagerID from activemanager  where email = \'" + post.mngEm + "\';" +
                   "SELECT @storeid:= storeID from store where store_number = \'" + post.mngStrNum  + "\';" +
    "delete from manage where storeid = @storeid and activeManagerID = @var_name;";

  if (post.mngStrNum == '') {
    alert("ERROR: Please enter store number!");
    // *******************************************************************************
    // Redirecting to Edit Manger Home Page
    setTimeout(function() {
      return res.redirect('/editManager');
    }, 400);
  }
  else {
    dbConnect.query(dbCheckStrExist, function(error, rows, fields) {
      if (rows.length == 0) {
        alert("ERROR: Store does not exist!");
        // *******************************************************************************
        // Redirecting to Edit Manger Home Page
        setTimeout(function() {
          return res.redirect('/editManager');
        }, 400);
      }
      else {
        dbConnect.query(dbUnsignMng, function(error, rows, fields) {
          alert("Unssigned Succeefully!");
          // *******************************************************************************
          // Redirecting to Edit Manger Home Page
          setTimeout(function() {
            return res.redirect('/editManager');
          }, 400);
        });
      }
    });
  }
});

router.get("/managerDetail", function(req, res) {
  res.render("managerDetail", {
    mngQuery: req.query,
  });
});

router.post("/managerDetail", function(req, res) {
  //value for update
  const post = {
    mngName: req.body.managerName,
    mngEm: req.body.managerEmail,
    mngStrNum: req.body.managerStoreNum,
  };
  //value before update
  const postOld = {
    mngName: decodeURIComponent(queryString.parse(req.headers.referer).name),
    mngEm: queryString.parse(req.headers.referer).email,
    mngStrNum: queryString.parse(req.headers.referer).id,
  };
  console.log(post);
  console.log(postOld);
  var dbCheckMngExist = 'SELECT * FROM activemanager WHERE email = \'' + post.mngEm + '\' UNION ALL SELECT * FROM inactiveManager WHERE email = \'' + post.mngEm + '\';';
  var dbCheckMngActive = 'SELECT * FROM manage WHERE storeID = \'' + post.mngStrNum + '\';';
  var dbCheckMngActiveMinus = 'SELECT * FROM manage WHERE storeID = -\'' + post.mngStrNum + '\';';
  var dbCheckStrExist = 'SELECT * FROM store WHERE storeID = \'' + post.mngStrNum + '\';';
  var dbCheckStrActive = 'SELECT * FROM manage WHERE storeID = \'' + post.mngStrNum + '\';';
  var dbDeleteMng = 'DELETE FROM inactivemanager WHERE email = \'' + post.mngEm + '\';';
  var dbAddMng = 'INSERT INTO inactivemanager(email, manager_name) VALUES(\'' + post.mngEm + '\',\'' + post.mngName + '\');';
  var dbUnsignMng = "select @var_name:= activeManagerID from activemanager  where email = \'" + post.mngEm + "\';" +
                   "SELECT @storeid:= storeID from store where store_number = \'" + post.mngStrNum  + "\';" +
    "delete from manage where storeid = @storeid and activeManagerID = @var_name;";
  var dbSignMng = "WITH CTE_Manager AS (SELECT activeManagerID AS managerID, email FROM activemanager UNION SELECT inactiveManagerID AS managerID, email FROM inactivemanager)" +
    "SELECT @managerid:= ManagerID FROM CTE_Manager where email = \'" + post.mngEm + "\'; SELECT @storeid:= storeID from store where store_number = " + post.mngStrNum + "; INSERT INTO manage SELECT @storeid,@managerid;";
  if (post.mngEm == '') {
    alert("ERROR: Please enter a valid Email!");
  } else {
    // delete an inacitve manager by email and empty name/storeID
    if (post.mngName == '' && post.mngStrNum == '') {
      dbConnect.query(dbCheckMngExist, function(error, rows, fields) {
        if (rows.length == 0) {
          alert("ERROR: Manager does not exist!");
        } else {
          dbConnect.query(dbCheckMngActive, function(error, rows, fields) {
            if (rows.length !== 0) {
              alert("ERROR: Manager is active, please unsign the manager before delete it!");
            } else {
              dbConnect.query(dbDeleteMng, function(error, rows, fields) {
                alert("Deleted Succeefully!");
              })
            }
          })
        }
      })
      // add an inactive manager by email, name and empty storeID
    } else if (post.mngName !== '' && post.mngStrNum == '') {
      dbConnect.query(dbCheckMngExist, function(error, rows, fields) {
        if (rows.length !== 0) {
          alert("ERROR: Manager already exists!");
        } else {
          dbConnect.query(dbAddMng, function(error, rows, fields) {
            console.log(dbAddMng);
            alert("Added Succeefully!");
          })
        }
      })
      // unsign a manager by email, -storeID and empty name
    } else if (post.mngStrNum < 0) {
      dbConnect.query(dbCheckMngActiveMinus, function(error, rows, fields) {
        if (rows.length == 0) {
          alert("ERROR: Manager is not active or does not exist!");
        } else {
          dbConnect.query(dbUnsignMng, function(error, rows, fields) {
            console.log(dbUnsignMng);
            console.log("nnnnnnnnnnnnnnnnnnnnnnnnn");
            console.log(dbUnsignMng);
            alert("Unassigned Succeefully!");
          })
        }
      })
      // sign a manager by email, +storeID and empty name
    } else if (post.mngStrNum > 0) {
      console.log('assignQ=' + dbSignMng);
      dbConnect.query(dbCheckMngExist, function(error, rows, fields) {
        console.log(rows);
        if (rows.length == 0) {
          alert("ERROR: Manager is active or does not exist!");
        } else {
          dbConnect.query(dbCheckStrExist, function(error, rows, fields) {
            if (rows.length == 0) {
              alert("ERROR: Store does not exist!");
            } else {
              dbConnect.query(dbSignMng, function(error, rows, fields) {
                alert("Assigned Succeefully!");
              })
            }
          })
        }
      })
    }
  }
});

module.exports = router
