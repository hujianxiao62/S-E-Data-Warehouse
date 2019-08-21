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

router.get("/RbPReport", function(req, res) {
  const dbQ = "WITH CTE_result AS (SELECT YEAR(SR.date) AS sales_year, CASE WHEN C.population < 3700000 THEN 'Small' "+
"WHEN C.population >= 3700000 AND C.population < 6700000 THEN 'Medium' WHEN C.population >= 6700000 AND C.population < 9000000 THEN 'Large' "+
"WHEN C.population >= 9000000 THEN 'Extra_Large' END AS city_category, SUM(SR.quantity * IFNULL(SLS.sale_price, P.retail_price)) AS revenue "+
"FROM SalesRecord SR INNER JOIN Product P ON P.pid = SR.pid INNER JOIN Store S ON SR.storeID = S.storeID "+
"INNER JOIN City C ON S.cityID = C.cityID LEFT JOIN OnSale SLS ON SLS.date = SR.date AND SLS.pid = SR.pid WHERE C.population IS NOT NULL "+
"GROUP BY YEAR(SR.date), CASE WHEN C.population < 3700000 THEN 'Small' WHEN C.population >= 3700000 AND C.population < 6700000 THEN 'Medium' "+
"WHEN C.population >= 6700000 AND C.population < 9000000 THEN 'Large' WHEN C.population >= 9000000 THEN 'Extra_Large' "+
"END) SELECT sales_year, SUM(CASE WHEN city_category = 'Small' THEN revenue ELSE 0 END) AS Small, SUM(CASE WHEN city_category = 'Medium' THEN "+
"revenue ELSE 0 END) AS Medium, SUM(CASE WHEN city_category = 'Large' THEN revenue ELSE 0 END) AS Large, SUM(CASE WHEN city_category = 'Extra_Large' "+
"THEN revenue ELSE 0 END) AS Extra_Large FROM CTE_result GROUP BY sales_year ORDER BY sales_year ASC;"

  dbConnect.query(dbQ, function(error, rows, fields) {
    res.render("RbPReport", {
      RbPR: rows
    });
  })
});

module.exports = router
