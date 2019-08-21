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

router.get("/SwHVreport", function(req, res) {
  var dbQyear = "SELECT DISTINCT YEAR(date) AS year FROM SALESRECORD;";

  dbConnect.query(dbQyear, function(error, rows, fields) {
    res.render("SwHVreport", {
      swhY: rows,
      swhM: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      swhR: []
    });
  })
});

var tmpY = "tmpY_error";
var tmpM = "tmpM_error";

router.post("/SwHVreport", function(req, res) {
  const y = req.body.selectpicker[0];
  const m = req.body.selectpicker[1];
  tmpY = y;
  tmpM = m;
  var dbQ = "SELECT DISTINCT YEAR(date) AS year FROM SALESRECORD; WITH CTE_Category " +
    " AS (" +
    " SELECT C.category_name, City.state, SUM(SR.quantity) AS numbers_of_sold_by_category" +
    " FROM SalesRecord SR" +
    " INNER JOIN Label L ON L.pid = SR.pid" +
    " INNER JOIN Category C ON L.categoryID = C.categoryID" +
    " INNER JOIN Store S ON SR.storeID = S.storeID" +
    " INNER JOIN City ON City.cityID = S.CityID" +
    " WHERE YEAR(SR .date) = " + y + " AND MONTH(SR.date) = " + m +
    " GROUP BY C.category_name, City.state)" +
    " , CTE_Category_Rank " +
    " AS (" +
    " SELECT category_name, state, numbers_of_sold_by_category," +
    " RANK () OVER (PARTITION BY category_name ORDER BY numbers_of_sold_by_category DESC) AS R" +
    " FROM CTE_Category)" +
    " SELECT" +
    " CCR.category_name," +
    " CCR.state AS highest_sales_state," +
    " numbers_of_sold_by_category AS total_units" +
    " FROM CTE_Category_Rank AS CCR "+
    " WHERE R = 1" +
    " ORDER BY CCR.category_name ASC;";

  dbConnect.query(dbQ, function(error, rows, fields) {
    console.log("MMMMMMMMMMMMMMMM");
    console.log(tmpM);
    console.log("YYYYYYYYYYYYYYYY");
    console.log(tmpY);
    res.render("SwHVreport", {
      swhY: rows[0],
      swhM: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      swhYM: [tmpY, tmpM],
      swhR: rows[1]
    });
  })
});

router.get("/SwHVDetail", function(req, res) {
  const category_name = decodeURIComponent(req.query.cn);
  const state = decodeURIComponent(req.query.state);
  const year = req.query.year;
  const month = req.query.month;
  var dbQ = "SELECT * FROM (" +
    " SELECT DISTINCT" +
    " S.store_number," +
    " S.street_address AS store_address," +
    " City.city," +
    " MR.manager_name," +
    " MR.email AS manager_email" +
    " FROM SalesRecord SR" +
    " INNER JOIN Label L ON SR.pid = L.pid" +
    " INNER JOIN Category C ON L.categoryID = C.categoryID" +
    " INNER JOIN Store S ON SR.storeID = S.storeID" +
    " INNER JOIN City ON City.cityID = S.cityID" +
    " LEFT JOIN Manage M ON S.storeID = M.storeID" +
    " LEFT JOIN ActiveManager MR ON MR.activeManagerID = M.activeManagerID" +
    " WHERE City.state = \'" + state + "\' AND C.category_name = \'" + category_name + "\' AND YEAR(SR.date) = \'" + year + "\' AND MONTH(SR.date) = \'" + month + "\'" +
    " ) temp" +
    " ORDER BY store_number ASC;";

  dbConnect.query(dbQ, function(error, rows, fields) {
    console.log('errrrrrrrrrrrrrrrrrrrrrrr');
    console.log(error);
    console.log(rows);
    res.render("SwHVDetail", {
      date: "Year: " + year + "     Month: " + month,
      SVR: rows,
      cat: category_name,
      state: state
    });
  })
});

module.exports = router
