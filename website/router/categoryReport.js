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

router.get("/categoryReport", function(req, res) {
  const dbQ = "SELECT C.category_name AS category_name, COUNT(DISTINCT P.pid) AS numbers_of_products, " +
"COUNT(DISTINCT P.manufacturerID) AS numbers_of_manufacturer, AVG(P.retail_price) AS average_retail_price " +
"FROM Category AS C LEFT JOIN Label AS L ON C.categoryID = L.categoryID " +
"LEFT JOIN Product AS P ON P.pid = L.pid GROUP BY C.category_name ORDER BY C.category_name ASC;";
  dbConnect.query(dbQ, function(error, rows, fields) {
    res.render("categoryReport", {
      catR: rows
    });
  })
});

module.exports = router
