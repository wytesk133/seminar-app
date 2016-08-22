var db = require('../lib/db');
var Event = require('../models/event');

module.exports = (req, res, next) => {
  db.get('configurations', (err, body) => {
    if (err) {
      next(new Error('Cannot read site configurations'));
    } else {
      res.locals.configurations = body;
      if (body.current_event_id) {
        Event.find(body.current_event_id, event => {
          res.locals.current_event = event;
          next();
        });
      } else {
        next();
      }
    }
  });
};
