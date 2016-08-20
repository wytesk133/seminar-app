var express = require('express');
var router = express.Router();
var User = require('../../models/user');
var params = require('params');

router.use((req, res, next) => {
  res.locals.title = 'User Management';
  // strong parameters
  if (req.body.user) {
    params(req.body.user).require('username', 'full_name');
    req.body.user = params(req.body.user).only('username', 'full_name', 'password', 'password_confirmation');
  }
  next();
});

// GET /users
// index
router.get('/', (req, res, next) => {
  User.all(users => {
    res.render('admin/users/index', { users: users, msg: req.flash('users_msg') });
  });
});

// GET /users/new
// new
// POST /users/new
// create
router.route('/new')
.all((req, res, next) => {
  res.locals.mode = 'new';
  next();
})
.get((req, res, next) => {
  res.render('admin/users/form', { user: {} });
})
.post((req, res, next) => {
  params(req.body.user).require('password');
  user = new User(req.body.user);
  user.save(err => {
    if (err) {
      res.render('admin/users/form', { user: user, error: 'Error saving: ' + err.message });
    } else {
      req.flash('users_msg');
      req.flash('users_msg', 'User created');
      res.redirect(req.app.locals.user_path(user));
    }
  });
});

// GET /users/:id
// show
router.get('/:id', (req, res, next) => {
  res.render('admin/users/show', { msg: req.flash('users_msg') });
});

// GET /users/:id/edit
// edit
// POST /users/:id/edit
// update
router.route('/:id/edit')
.all((req, res, next) => {
  res.locals.mode = 'edit';
  next();
})
.get((req, res, next) => {
  res.render('admin/users/form');
})
.post((req, res, next) => {
  res.locals.user.update(req.body.user, err => {
    if (err) {
      res.render('admin/users/form', { error: 'Error saving: ' + err.message });
    } else {
      req.flash('users_msg');
      req.flash('users_msg', 'User updated');
      res.redirect(req.app.locals.user_path(res.locals.user));
    }
  });
});

// GET /users/:id/delete
// confirm destroy
// POST /users/:id/delete
// destroy
router.route('/:id/delete')
.get((req, res, next) => {
  res.render('admin/users/delete');
})
.post((req, res, next) => {
  res.locals.user.destroy(err => {
    if (err) {
      req.flash('users_msg')
      req.flash('users_msg', 'User NOT deleted')
      res.redirect(req.app.locals.user_path(res.locals.user));
    } else {
      req.flash('users_msg');
      req.flash('users_msg', 'User deleted');
      res.redirect(req.app.locals.users_path);
    }
  });
});

// parse user id
router.param('id', (req, res, next, id) => {
  User.find(id, user => {
    if (user) {
      res.locals.user = user;
      next();
    } else {
      next(new Error('User not found'));
    }
  });
});

module.exports = router;
