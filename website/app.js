//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mySQL = require("mysql");
const queryString = require('query-string');
const alert = require('alert-node');

const app = express();
const dbConnect = mySQL.createConnection({
  host: 'localhost',
  user: 'gatechUser',
  password: 'gatech123',
  database: 'cs6400_team024',
  multipleStatements: true
});

dbConnect.connect(function(error) {
  if (!!error) {
    console.log('error');
  } else {
    console.log('connected');
  }
});

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.use(require('./router/home'));
app.use(require('./router/holiday'));
app.use(require('./router/manager'));
app.use(require('./router/population'));
app.use(require('./router/manufacturerReport'));
app.use(require('./router/categoryReport'));
app.use(require('./router/AvPReport'));
app.use(require('./router/acReport'));
app.use(require('./router/RbPReport'));
app.use(require('./router/SRbYbSreport'));
app.use(require('./router/SwHVreport'));

app.get('/test', function (req, res) {
  res.render('test');
});

// when Add to Top button is clicked
app.post('/top', function (req, res) {
  console.log(req.body.todo + " is added to top of the list.");
  res.redirect('/test');
});

// when Add to Bottom button is clicked
app.post('/bottom', function (req, res) {
  console.log(req.body.todo + " is added to bottom of the list.");
  res.redirect('/test');
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
