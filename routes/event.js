var router = require('express').Router();
var db = require('../lib/db');

router.get('/', (req, res, next) => {
  res.render('event/index', { title: 'Seminar' });
});

router.get('/agenda', (req, res, next) => {
  db.attachment.get(res.locals.current_event._id, 'agenda.pdf', (err, body) => {
    if (err) next(err);
    else {
      res.set('Content-Type', 'application/pdf');
      res.send(body);
    }
  });
});

module.exports = router;
