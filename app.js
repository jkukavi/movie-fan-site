const serverless = require('serverless-http');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const db = require('./db/db.js')
var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
const helmet = require('helmet')
var cookieParser = require('cookie-parser');

//creating app
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// setting helmet, logger, encoding, cookieParser and static folder
app.use(helmet())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')));

// defining routes
app.use('/', indexRouter);
app.use('/user', userRouter);

// error handling
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports.handler = serverless(app);
