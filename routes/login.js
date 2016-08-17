var express = require('express');
var router = express.Router();
var nextPage = '/admin';
var User = require('../models/user');

router.get('/', (req, res, next) => {
  if (req.session.user) {
    res.redirect(nextPage);
  } else {
    res.render('login', { title: 'Login', error: req.flash('login_error') });
  }
});

router.post('/', (req, res, next) => {
  User.authenticate(req.body.username, req.body.password, id => {
    if (id) {
      req.session.user = id;
      res.redirect(nextPage);
    } else {
      delete req.session.user;
      res.render('login', { title: 'Login', error: 'Invalid username or password' });
    }
  });
});

module.exports = router;
