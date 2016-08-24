var router = require('express').Router();
var Participant = require('../models/participant');

router.get('/:token', function(req, res, next) {
  Participant.findBy('token', req.params.token, participant => {
    if (participant && participant.event_id == res.locals.configurations.current_event_id) {
      req.session.current_participant_id = participant._id;
      participant.entered = Date.now();
      participant.save(err => {
        if (err) {
          next(err);
        } else {
          res.render('enter', { random: Date.now() });
        }
      });
    } else {
      delete req.session.current_participant_id;
      next(new Error('Invalid token'));
    }
  });
});

module.exports = router;
