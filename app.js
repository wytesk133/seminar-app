var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sessions = require("client-sessions");
var flash = require('connect-flash');

require('./lib/seed'); // populate the database (if needed)
require('./lib/associations'); // setup model associations

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
app.use(require('./middlewares/getConfigurations'));
app.use('/', require('./routes/index'));
app.use('/enter', require('./routes/enter'));
app.use('/event', require('./middlewares/requireEnter'), require('./routes/event'));
// admin stuff
app.use('/login', require('./routes/login'));
app.use('/logout', require('./routes/logout'));
app.use('/admin', require('./middlewares/requireAuthentication'), require('./routes/admin'));

// url helpers
var join = path.posix.join; // a temporary hack
app.locals.root_path = '/';
app.locals.images_path = join(app.locals.root_path, 'images');
app.locals.javascripts_path = join(app.locals.root_path, 'javascripts');
app.locals.stylesheets_path = join(app.locals.root_path, 'stylesheets');
app.locals.event_page_path = join(app.locals.root_path, 'event');
app.locals.say_path = join(app.locals.event_page_path, 'say');
app.locals.event_agenda_path = join(app.locals.event_page_path, 'agenda');
app.locals.event_questionnaire_path = join(app.locals.event_page_path, 'questionnaire');
// admin
app.locals.login_path = join(app.locals.root_path, 'login');
app.locals.logout_path = join(app.locals.root_path, 'logout');
app.locals.admin_path = join(app.locals.root_path, 'admin');
// users
app.locals.users_path = join(app.locals.admin_path, 'users');
app.locals.new_user_path = join(app.locals.users_path, 'new');
app.locals.user_path = user => {
  return join(app.locals.users_path, user._id);
};
app.locals.edit_user_path = user => {
  return join(app.locals.user_path(user), 'edit');
};
app.locals.delete_user_path = user => {
  return join(app.locals.user_path(user), 'delete');
};
// events
app.locals.events_path = join(app.locals.admin_path, 'events');
app.locals.new_event_path = join(app.locals.events_path, 'new');
app.locals.event_path = event => {
  return join(app.locals.events_path, event._id);
};
app.locals.edit_event_path = event => {
  return join(app.locals.event_path(event), 'edit');
};
app.locals.delete_event_path = event => {
  return join(app.locals.event_path(event), 'delete');
};
app.locals.use_event_path = event => {
  return join(app.locals.event_path(event), 'use');
};
app.locals.agenda_path = event => {
  return join(app.locals.event_path(event), 'agenda');
};
app.locals.qr_path = event => {
  return join(app.locals.event_path(event), 'qr');
};
app.locals.clear_entry_path = event => {
  return join(app.locals.event_path(event), 'clear');
};
app.locals.questionnaire_builder_path = event => {
  return join(app.locals.event_path(event), 'questionnaire');
};
app.locals.clear_event_path =  join(app.locals.events_path, 'clear');
// participants
app.locals.add_participant_path = event => {
  return join(app.locals.event_path(event), 'add');
};
app.locals.import_participant_path = event => {
  return join(app.locals.event_path(event), 'import');
};
app.locals.participant_path = participant => {
  return join(app.locals.admin_path, 'participants', participant._id);
};
app.locals.edit_participant_path = participant => {
  return join(app.locals.participant_path(participant), 'edit');
};
app.locals.delete_participant_path = participant => {
  return join(app.locals.participant_path(participant), 'delete');
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
