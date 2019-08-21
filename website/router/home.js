//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mySQL = require("mysql");
const queryString = require('query-string');
const alert = require('alert-node');

const router = express.Router();
const dbConnect = mySQL.createConnection({
  host: 'localhost',
  user: 'gatechUser',
  password: 'gatech123',
  database: 'cs6400_team024',
  multipleStatements: true
});


router.get("/about", function(req, res) {
  res.render("about", {
  });
});

router.get("/", function(req, res) {
  const dbQ1 = "SELECT COUNT(storeID) AS sNum FROM Store; SELECT COUNT(manufacturerID) AS mfNum FROM Manufacturer; SELECT COUNT(DISTINCT pid) AS pNum FROM Product;";

  const dbQ2 = "WITH CTE_Manager AS (SELECT activeManagerID AS managerID FROM activemanager UNION SELECT inactiveManagerID AS managerID FROM inactivemanager) SELECT count(distinct managerid) AS mngNum FROM CTE_Manager;";

  const dbQ = dbQ1+dbQ2;

  dbConnect.query(dbQ, function(error, rows, fields) {
    console.log(rows[0]);
    res.render("home", {
      sNum:rows[0][0].sNum,
      mfNum:rows[1][0].mfNum,
      pNum:rows[2][0].pNum,
      mngNum:rows[3][0].mngNum
    });
  });
});

module.exports = router
