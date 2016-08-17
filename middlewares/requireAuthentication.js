module.exports = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    req.flash('login_error', 'Login required');
    res.redirect('/login');
  }
};
