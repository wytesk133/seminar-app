var router = require('express').Router();
var Participant = require('../../models/participant');
var params = require('params');

router.use((req, res, next) => {
  res.locals.title = 'Participant Management';
  if (req.body.participant) {
    params(req.body.participant).require('name', 'company');
    req.body.participant = params(req.body.participant).only('name', 'position', 'company');
  }
  next();
});

// GET /participants/:id
// show
router.get('/:id', (req, res, next) => {
  res.render('admin/participants/show', { msg: req.flash('participants_msg') });
});

// GET /participants/:id/edit
// edit
// POST /participants/:id/edit
// update
router.route('/:id/edit')
.all((req, res, next) => {
  res.locals.mode = 'edit';
  next();
})
.get((req, res, next) => {
  res.render('admin/participants/form');
})
.post((req, res, next) => {
  res.locals.participant.update(req.body.participant, err => {
    if (err) {
      res.render('admin/participants/form', { error: 'Error saving: ' + err.message });
    } else {
      req.flash('participants_msg');
      req.flash('participants_msg', 'Participant updated');
      res.redirect(req.app.locals.participant_path(res.locals.participant));
    }
  });
});

// GET /participants/:id/delete
// confirm destroy
// POST /participants/:id/delete
// destroy
router.route('/:id/delete')
.get((req, res, next) => {
  res.render('admin/participants/delete');
})
.post((req, res, next) => {
  var event_id = res.locals.participant.event_id;
  res.locals.participant.destroy(err => {
    if (err) {
      req.flash('participants_msg')
      req.flash('participants_msg', 'Participant NOT deleted')
      res.redirect(req.app.locals.participant_path(res.locals.participant));
    } else {
      req.flash('participants_msg');
      req.flash('participants_msg', 'Participant deleted');
      res.redirect(req.app.locals.event_path(res.locals.event));
    }
  });
});

// parse participant id
router.param('id', (req, res, next, id) => {
  Participant.find(id, participant => {
    if (participant) {
      res.locals.participant = participant;
      res.locals.participant.event(event => {
        res.locals.event = event;
        next();
      });
    } else {
      next(new Error('Participant not found'));
    }
  });
});

module.exports = router;
