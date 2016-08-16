var express = require('express');
var router = express.Router();
var nextPage = '/admin';

router.get('/', (req, res, next) => {
  if (req.session.user_id) {
    res.redirect(nextPage);
  } else {
    res.render('login', { title: 'Login', error: req.flash('login_error') });
  }
});

router.post('/', (req, res, next) => {
  // for testing only
  if (req.body.username == 'admin' && req.body.password == 'password') {
    req.session.user_id = 1;
    res.redirect(nextPage);
  } else {
    delete req.session.user_id;
    res.render('login', { title: 'Login', error: 'Invalid username or password' });
  }
});

module.exports = router;
