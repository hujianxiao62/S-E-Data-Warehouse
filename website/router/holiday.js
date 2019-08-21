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

router.get("/editHoliday", function(req, res) {
  res.render("editHoliday", {
    dateR: []
  });
});

router.post("/searchHoliday", function(req, res) {
  const post = {
    sd: req.body.startDate,
    ed: req.body.endDate,
    holiday: req.body.holiday
  };
  const d = {
    sdY: post.sd.substring(0, 4),
    sdM: post.sd.substring(5, 7),
    sdD:  post.sd.substring(8, 10),
    sdDa: post.sd.substring(4, 5) + post.sd.substring(7, 8),
    edY: post.ed.substring(0, 4),
    edM: post.ed.substring(5, 7),
    edD: post.ed.substring(8, 10),
    edDa: post.ed.substring(4, 5) + post.ed.substring(7, 8),
  };
  var dbQ = '';
  var checkSD = d.sdY >= 2000 && d.sdY <= 2012 && d.sdM > 0 && d.sdM < 13 && d.sdD >= 0 && d.sdD < 32;
  var checkED = d.edY >= 2000 && d.edY <= 2012 && d.edM > 0 && d.edM < 13 && d.edD >= 0 && d.edD < 32;
  var checkSDdash = d.sdDa === '--';
  var checkEDdash = d.edDa === '--';
  var sd = post.sd !== '' && (!checkSD || !checkSDdash); //start day is invalid
  var ed = post.ed !== '' && (!checkED || !checkEDdash); //end day is invalid

  if ((post.sd !== '') && (!checkSDdash)) {
    alert("ERROR: Please enter start date in format YYYY-MM-DD!")
  }
  else if ((post.sd !== '') && (!checkSD))
  {
    alert("ERROR: Please enter valid start date from 2000-01-01 to 2012-07-01!");
  }
  else if ((post.ed !== '') && (!checkEDdash)) {
    alert("ERROR: Please enter end date in format YYYY-MM-DD!")
  }
  else if ((post.ed !== '') && (!checkED))
  {
    alert("ERROR: Please enter valid end date from 2000-01-01 to 2012-07-01!");
  }
  else {
    //check query to use
    //search by nothing - list all holidays
    if (post.sd == '' && post.ed == '' && post.holiday == '') {
      dbQ = "SELECT * FROM date WHERE holiday_name <> \'\';";
    }
    //search by only start date
    else if (post.sd !== '' && post.ed == '' && post.holiday == '') {
      dbQ = "SELECT * FROM date WHERE date >= \'" + post.sd + "\' AND holiday_name <> \'\';";
    }
    //search by only end date
    else if (post.sd == '' && post.ed !== '' && post.holiday == '') {
      dbQ = "SELECT * FROM date WHERE date <= \'" + post.ed + "\' AND holiday_name <> \'\';";
    }
    //search only by holiday name
    else if (post.sd == '' && post.ed == '' && post.holiday !== '') {
      dbQ = "SELECT * FROM date WHERE holiday_name LIKE \'%" + post.holiday.replace("'", "\\'") + "%\';";
    }
    //search by a time period - start date and end date
    else if (post.sd !== '' && post.ed !== '' && post.holiday == '') {
      dbQ = "SELECT * FROM date WHERE date >= \'" + post.sd + "\' AND date <= \'" + post.ed + "\' AND holiday_name <> \'\';";
    }
    //search by start date and holiday name
    else if (post.sd !== '' && post.ed == '' && post.holiday !== '') {
      dbQ = "SELECT * FROM date WHERE date >= \'" + post.sd + "\' AND holiday_name LIKE \'%" + post.holiday.replace("'", "\\'") + "%\';";
    }
    //search by end date and holiday name
    else if (post.sd == '' && post.ed !== '' && post.holiday == '') {
      dbQ = "SELECT * FROM date WHERE date <= \'" + post.ed + "\' AND holiday_name LIKE \'%" + post.holiday.replace("'", "\\'") + "%\';";
    }
    //search by start date, end date and holiday name
    else{
      dbQ = "SELECT * FROM date WHERE holiday_name LIKE \'%" + post.holiday.replace("'", "\\'") + "%\' AND  date >= \'" + post.sd + "\' AND date <= \'" + post.ed + "\';";
    }
    if (dbQ !== '') {
      dbConnect.query(dbQ, function(error, rows, fields) {
        res.render("editHoliday", {
          dateR: rows
        });
      })
    }
  }
});

router.post("/addHoliday", function(req, res) {
  const post = {
    date: req.body.startDate,
    holiday: req.body.holiday
  };

  const d = {
    sdY: post.date.substring(0, 4),
    sdM: post.date.substring(5, 7),
    sdD: post.date.substring(8, 10),
    sdDa: post.date.substring(4, 5) + post.date.substring(7, 8),

  };
  var dbQ = '';
  var checkSD = d.sdY >= 2000 && d.sdY <= 2012 && d.sdM > 0 && d.sdM < 13 && d.sdD >= 0 && d.sdD < 32;
  var checkSDdash = d.sdDa === '--';
  var sd =  (!checkSD || !checkSDdash); //start day is invalid

  if (!checkSDdash) {
    alert("ERROR: Please enter start date in format YYYY-MM-DD!")
  }
  else if (!checkSD) {
    alert("ERROR: Please enter valid start date from 2000-01-01 to 2012-07-01 !");  //check valid date input
  }
  else {
    dbQ1 = "UPDATE date SET holiday_name = \'" + post.holiday.replace("'", "\\'") + '\' WHERE date = \'' + post.date + '\';';
        dbConnect.query(dbQ1, function(error, rows, fields) {
          alert("Updated Succeefully!");
        })
  }

});


module.exports = router
