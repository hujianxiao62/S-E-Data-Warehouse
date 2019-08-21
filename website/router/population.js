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

router.get("/editPopulation", function(req, res) {
  res.render("editPopulation", {
    cityR: []
  });
});

router.post("/editPopulation", function(req, res) {
  const post = {
    city: req.body.city,
    state: req.body.state,
  };
  var dbQ = "SELECT city, state, population FROM city WHERE " + 'city LIKE \'%' + post.city + '%\' AND state LIKE\'%' + post.state + '%\';';

  console.log('editPopulation SQL: ' + dbQ);

  dbConnect.query(dbQ, function(error, rows, fields) {
    if (!!error) {
      console.log('ERROR: editManager SQL');
    } else {
      console.log(rows);
      res.render("editPopulation", {
        cityR: rows
      });
    }
  });
});

router.get("/populationDetail", function(req, res) {
  res.render("populationDetail", {
    popQuery: req.query,
    popDetailBtn: "update"
  });
  console.log(req.query);
});

router.post("/populationDetail", function(req, res) {
  const post = {
    city: queryString.parse(req.headers.referer).city,
    state: queryString.parse(req.headers.referer).state,
    population: req.body.population,
  };

  const postOld = {
    city: queryString.parse(req.headers.referer).city,
    state: queryString.parse(req.headers.referer).state,
    population: queryString.parse(req.headers.referer).population,
  };
  var dbQ = "UPDATE city SET population = \'" + post.population + '\' WHERE city = \'' + post.city + '\' AND state = \'' + post.state + '\';';

  console.log('populationDetail SQL: ' + dbQ);

  if (isNaN(post.population) || !Number.isInteger(parseFloat(post.population)) || post.population <= 0 || post.population === postOld.population || post.population >= 2000000000) {
    alert('ERROR: Population should be an integer(0,2b] and different from the previous');
  } else {
    dbConnect.query(dbQ, function(error, rows, fields) {
      alert('Updated Succeefully!');
      // *******************************************************************************
      // Redirecting to Edit Population page
      setTimeout(function() {
        return res.redirect('/editPopulation');
      }, 400);
    });
  }
});

module.exports = router
