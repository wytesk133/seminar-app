var express = require('express');
var router = express.Router();
var Participant = require('../models/participant');

router.get('/:token', function(req, res, next) {
  res.locals.participant.entered = Date.now();
  res.locals.participant.save(err => {
    if (err) {
      next(err);
    } else {
      req.session.current_participant_id = res.locals.participant._id;
      res.redirect(req.app.locals.root_path);
    }
  });
});

// parse user id
router.param('token', (req, res, next, token) => {
  Participant.findBy('token', token, participant => {
    if (participant) {
      res.locals.participant = participant;
      next();
    } else {
      next(new Error('Invalid token'));
    }
  });
});

module.exports = router;
