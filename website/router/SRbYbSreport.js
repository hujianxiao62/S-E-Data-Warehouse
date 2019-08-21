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

router.get("/SRbYbSreport", function(req, res) {
  var dbQ = "SELECT DISTINCT state FROM city ORDER BY state ASC;";
  dbConnect.query(dbQ, function(error, rows, fields) {
    res.render("SRbYbSreport", {
      SRRstate: rows,
      SRR: [],
      currentState:''
    });
  })
});

router.post("/SRbYbSreport", function(req, res) {
  const st = req.body.selectpicker;
  const dbQ = "SELECT DISTINCT state FROM city ORDER BY state ASC; SELECT S.store_number, S.street_address AS store_address, C.city, YEAR(SR.date) AS sales_year, SUM(SR.quantity * IFNULL(SLS.sale_price, P.retail_price)) "+
  "AS Total_Revenue FROM Store S INNER JOIN City C ON S.cityID = C.cityID LEFT JOIN SalesRecord SR ON S.storeID = SR.storeID LEFT JOIN Product P ON SR.pid = "+
  "P.pid LEFT JOIN OnSale SLS ON SLS.date = SR.date AND SR.pid = SLS.pid WHERE C.state = \'" + st + "\' GROUP BY S.store_number, S.street_address, C.city, YEAR(SR.date) "+
  "ORDER BY YEAR(SR.date) ASC, SUM(SR.quantity * IFNULL(SLS.sale_price, P.retail_price)) DESC;";

  dbConnect.query(dbQ, function(error, rows, fields) {
    console.log(rows);
    res.render("SRbYbSreport", {
      SRRstate: rows[0],
      SRR: rows[1],
      currentState: st
    });
  })
});


module.exports = router
