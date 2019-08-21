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

router.get("/acReport", function(req, res) {
  const dbQ = "SELECT " +
"YEAR(DD.date) AS sales_year, "+
"SUM(SR.quantity) AS total_number_of_sold, "+
"SUM(SR.quantity)/365 AS average_numbers_of_sold, "+
"SUM(CASE WHEN month(DD.date) = 2 and day(DD.date) = 2 THEN SR.quantity "+
"ELSE 0 END) AS numbers_of_sold_on_groundhog "+
"FROM Date DD "+
"INNER JOIN SalesRecord SR ON DD.date = SR.date "+
"INNER JOIN Label L ON SR.pid = L.pid "+
"INNER JOIN Category C ON L.categoryID = C.categoryID "+
"WHERE C.category_name = 'Air Conditioner' "+
"GROUP BY YEAR (DD.date) " +
"ORDER BY YEAR (DD.date) ASC;";

  dbConnect.query(dbQ, function(error, rows, fields) {
    res.render("acReport", {
      acR: rows
    });
  })
});

module.exports = router
