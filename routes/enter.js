var express = require('express');
var router = express.Router();
var Participant = require('../models/participant');

router.get('/:token', function(req, res, next) {
  res.participant.entered = Date.now();
  res.participant.save(err => {
    if (err) {
      next(err);
    } else {
      req.session.current_participant_id = res.participant._id;
      res.redirect(req.app.locals.event_page_path);
    }
  });
});

// parse user id
router.param('token', (req, res, next, token) => {
  Participant.findBy('token', token, participant => {
    if (participant && participant.event_id == res.locals.configurations.current_event_id) {
      res.participant = participant;
      next();
    } else {
      delete req.session.current_participant_id;
      next(new Error('Invalid token'));
    }
  });
});

module.exports = router;
