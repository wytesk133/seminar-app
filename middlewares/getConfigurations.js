var db = require('../lib/db');
var Event = require('../models/event');
var WordCloudQ = require('../models/wordCloudQ');

module.exports = (req, res, next) => {
  db.get('configurations', (err, body) => {
    if (err) {
      next(new Error('Cannot read site configurations'));
    } else {
      res.locals.configurations = body;
      if (body.current_event_id) {
        Event.find(body.current_event_id, event => {
          res.locals.current_event = event;
          if (body.current_wordcloud_id) {
            WordCloudQ.find(body.current_wordcloud_id, wordcloud => {
              if (wordcloud.event_id == event._id) res.locals.current_wordcloud = wordcloud;
              next();
            });
          } else {
            next();
          }
        });
      } else {
        next();
      }
    }
  });
};
