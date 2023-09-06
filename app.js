require('dotenv/config')
require('./config/database.config')();
// var createError = require('http-errors');
const cors = require('cors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const PASSPORT = require('passport');
const REGISTER_STRATEGY = require('./config/passport').localRegister();
const LOGIN_STRATEGY = require('./config/passport').localLogin();

var usersRouter = require('./routes/users');
var voteRouter = require('./routes/vote');
var votetypeRouter = require('./routes/voteType');
var discussionRouter = require('./routes/discussion');

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(cors('*'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(PASSPORT.initialize());
PASSPORT.use('local-register', REGISTER_STRATEGY);
PASSPORT.use('local-login', LOGIN_STRATEGY);

app.use('/users', usersRouter);
app.use('/vote', voteRouter);
app.use('/votetype', votetypeRouter);
app.use('/discussion', discussionRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;
