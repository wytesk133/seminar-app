var express = require('express');
var router = express.Router();
var User = require('../models/user');

router.use((req, res, next) => {
  res.locals.next_page = req.app.locals.admin_path;
  res.locals.title = 'Login';
  next();
});

router.get('/', (req, res, next) => {
  if (req.session.user) {
    res.redirect(res.locals.next_page);
  } else {
    res.locals.error = req.flash('login_error')
    res.render('login');
  }
});

router.post('/', (req, res, next) => {
  User.authenticate(req.body.username, req.body.password, id => {
    if (id) {
      req.session.user = id;
      res.redirect(res.locals.next_page);
    } else {
      delete req.session.user;
      res.locals.error = 'Invalid username or password';
      res.render('login');
    }
  });
});

module.exports = router;
