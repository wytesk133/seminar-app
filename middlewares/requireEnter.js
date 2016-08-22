var Participant = require('../models/participant');

module.exports = (req, res, next) => {
  if (req.session.current_participant_id) {
    Participant.find(req.session.current_participant_id, participant => {
      if (participant && participant.event_id == res.locals.configurations.current_event_id) {
        res.locals.current_participant = participant;
        next();
      } else {
        delete req.session.current_participant_id;
        next(new Error('Session expired'));
      }
    });
  } else {
    res.redirect(req.app.locals.root_path);
  }
};
