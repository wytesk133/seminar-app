var router = require('express').Router();
var User = require('../models/user');

router.use((req, res, next) => {
  res.next_page = req.app.locals.admin_path;
  res.locals.title = 'Login';
  next();
});

router.route('/')
.get((req, res, next) => {
  if (req.session.current_user_id) {
    res.redirect(res.next_page);
  } else {
    res.render('login', { error: req.flash('login_error') });
  }
})
.post((req, res, next) => {
  delete req.session.current_user_id; //clear old session data
  User.findBy('username', req.body.username, user => {
    if (user) {
      user.authenticate(req.body.password, ok => {
        if (ok) {
          req.session.current_user_id = user._id;
          res.redirect(res.next_page);
        } else {
          res.render('login', { error: 'Invalid username or password' });
        }
      });
    } else {
      res.render('login', { error: 'Invalid username or password' });
    }
  });
});

module.exports = router;
