var express = require('express');
var path = require('path');
const session = require('express-session');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
var cors = require('cors');

var index = require('./routes/index');
var users = require('./routes/users');
const config = require('./model/config');

mongoose.createConnection(config.dbUri);
var db = mongoose.connection;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(busboy());
app.use(session({
  secret: config.secret,
  resave: false,
  cookie: { httpOnly: false },
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: db })
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
