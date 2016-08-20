var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sessions = require("client-sessions");
var flash = require('connect-flash');

require('./lib/seed'); // populate the database (if needed)

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(sessions({
  cookieName: 'session',
  secret: process.env.COOKIE_SECRET,
  cookie: {
    ephemeral: true
  }
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/', require('./routes/index'));
app.use('/login', require('./routes/login'));
app.use('/logout', require('./routes/logout'));
app.use('/admin', require('./middlewares/requireAuthentication'), require('./routes/admin'));

// url helpers
var join = path.posix.join; // a temporary hack
app.locals.root_path = '/';
app.locals.login_path = join(app.locals.root_path, 'login');
app.locals.logout_path = join(app.locals.root_path, 'logout');
app.locals.admin_path = join(app.locals.root_path, 'admin');
app.locals.users_path = join(app.locals.admin_path, 'users');
app.locals.new_user_path = join(app.locals.users_path, 'new');
app.locals.user_path = user => {
  console.log(app.locals.users_path, user._id);
  console.log(join(app.locals.users_path, user._id));
  return join(app.locals.users_path, user._id);
};
app.locals.edit_user_path = user => {
  return join(app.locals.user_path(user), 'edit');
};
app.locals.delete_user_path = user => {
  return join(app.locals.user_path(user), 'delete');
};

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;