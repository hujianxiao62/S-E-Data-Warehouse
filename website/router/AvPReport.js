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

router.get("/AvPReport", function(req, res) {
  const dbQ = "SELECT " +
"P.pid AS productID, "+
"P.product_name, "+
"P.retail_price, "+
"SUM(SR.quantity) AS numbers_of_sold, "+
"SUM(CASE WHEN SLS.sale_price IS NOT NULL THEN SR.quantity "+
"ELSE 0 END) AS numbers_of_sold_at_discount, "+
"SUM(CASE WHEN SLS.sale_price IS NULL THEN SR.quantity "+
"	ELSE 0 END) AS numbers_of_sold_at_retail_price, "+
"SUM(SR.quantity * IFNULL(SLS.sale_price, P.retail_price)) AS actual_revenue, "+
"SUM(CASE WHEN SLS.sale_price IS NULL THEN SR.quantity * P.retail_price "+
"ELSE SR.quantity *(1-0.25)*P.retail_price END) AS predicted_revenue, "+
"SUM(SR.quantity * IFNULL(SLS.sale_price, P.retail_price) - "+
"(CASE WHEN SLS.sale_price IS NULL THEN SR.quantity * P.retail_price "+
"ELSE SR.quantity *(1-0.25)*P.retail_price END) )AS difference_of_revenue "+
"FROM SalesRecord AS SR "+
"INNER JOIN Label AS L ON SR.pid = L.pid " +
"INNER JOIN Category C ON C.categoryID = L.categoryID "+
"INNER JOIN Product AS P ON P.pid = L.pid "+
"LEFT JOIN OnSale AS SLS ON SLS.date = SR.date AND SLS.pid = P.pid "+
"WHERE C.category_name = 'GPS' "+
"GROUP BY P.pid, P.product_name, P.retail_price "+
"HAVING ABS(SUM(SR.quantity * IFNULL(SLS.sale_price, P.retail_price) - "+
"(CASE WHEN SLS.sale_price IS NULL THEN SR.quantity * P.retail_price "+
"ELSE SR.quantity *(1-0.25)*P.retail_price END) )) >5000 "+
"ORDER BY (SUM(SR.quantity * IFNULL(SLS.sale_price, P.retail_price) - "+
"(CASE WHEN SLS.sale_price IS NULL THEN SR.quantity * P.retail_price "+
"ELSE SR.quantity *(1-0.25)*P.retail_price END) )) DESC;";

  dbConnect.query(dbQ, function(error, rows, fields) {
    res.render("AvPReport", {
      avpR: rows
    });
  })
});

module.exports = router
