module.exports = (req, res, next) => {
  if (req.session.user_id) {
    next();
  } else {
    req.flash('login_error', 'Login required');
    res.redirect('/login');
  }
};
