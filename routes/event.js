var router = require('express').Router();
var db = require('../lib/db');

router.use((req, res, next) => {
  res.locals.title = res.locals.current_event.name;
  next();
});

router.get('/', (req, res, next) => {
  res.render('event/index');
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

router.route('/questionnaire')
.get((req, res, next) => {
  res.render('event/questionnaire');
})
.post((req, res, next) => {
  // TODO: sanitize
  res.locals.current_participant.questionnaire = req.body.answers;
  res.locals.current_participant.save(err => {
    if (err) next(err);
    else res.redirect(req.app.locals.event_page_path);
  });
});

module.exports = router;
