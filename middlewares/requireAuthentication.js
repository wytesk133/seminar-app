var User = require('../models/user');

module.exports = (req, res, next) => {
  if (req.session.current_user_id) {
    User.find(req.session.current_user_id, user => {
      if (user) {
        res.locals.current_user = user;
        next();
      } else {
        delete req.session.current_user_id;
        req.flash('login_error');
        req.flash('login_error', 'Session expired');
        res.redirect(req.app.locals.login_path);
      }
    });
  } else {
    req.flash('login_error'); // clear old message(s)
    req.flash('login_error', 'Login required');
    res.redirect(req.app.locals.login_path);
  }
};
