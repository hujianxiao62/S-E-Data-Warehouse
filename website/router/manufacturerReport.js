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

router.get("/manufacturerReport", function(req, res) {
  const dbQ = 'SELECT M.manufacturer_name, COUNT(DISTINCT P.PID) AS numbers_of_products, AVG(P.retail_price) AS average_retail_price, MIN(P.retail_price) ' +
    'AS minimum_retail_price, MAX(P.retail_price) AS maximum_retail_price FROM Product P INNER JOIN Manufacturer M ON P.manufacturerID = M.manufacturerID ' +
    'GROUP BY M.manufacturer_name ORDER BY AVG (P.retail_price) DESC LIMIT 100;'
  dbConnect.query(dbQ, function(error, rows, fields) {
    res.render("manufacturerReport", {
      mfR: rows
    });
  })
});


router.get("/manufacturerDetail", function(req, res) {
  const mfName = decodeURIComponent(req.query.mfNm);
  const dbQ = "SELECT MF.manufacturer_name, MF.max_discount AS maximum_discount, P.pid AS product_ID, P.product_name, " +
    "GROUP_CONCAT(DISTINCT C.category_name ORDER BY C.category_name ASC SEPARATOR  ',') AS category_name, P.retail_price AS price FROM " +
    "Manufacturer AS MF LEFT JOIN Product AS P ON P.manufacturerID = MF.manufacturerID LEFT JOIN Label AS L ON P.pid = L.pid LEFT JOIN " +
    "Category AS C ON C.categoryID = L.categoryID GROUP BY MF.manufacturer_name, MF.max_discount, P.pid, P.product_name, P.retail_price ORDER BY P.retail_price DESC ) AS T WHERE manufacturer_name = \'" + mfName + '\';';
  const dbQPlst = "SELECT product_ID, product_name, category_name, price FROM (" + dbQ;
  const dbQPnum = "SELECT COUNT(*) AS Pnum FROM (" + dbQ;
  const dbQPavg = "SELECT AVG(price) AS Pavg FROM (" + dbQ;
  const dbQPmax = "SELECT MAX(price) AS Pmax FROM (" + dbQ;
  const dbQPmin = "SELECT MIN(price) AS Pmin FROM (" + dbQ;
  const dbQmd = "SELECT max_discount AS md FROM manufacturer WHERE manufacturer_name = \'" + mfName + '\';';
  const dbQtotal = dbQPlst + dbQPnum + dbQPavg + dbQPmax + dbQPmin + dbQmd;

  dbConnect.query(dbQtotal, function(error, rows, fields) {
    res.render("manufacturerDetail", {
      mfN:mfName,
      Plst:rows[0],
      Pnum:rows[1][0].Pnum,
      Pavg:(rows[2][0].Pavg).toFixed(2),
      Pmax:rows[3][0].Pmax,
      Pmin:rows[4][0].Pmin,
      md:(rows[5][0].md * 100).toFixed(2) + '%'
    });
  });

});

module.exports = router
