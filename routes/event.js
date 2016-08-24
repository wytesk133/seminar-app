var router = require('express').Router();
var db = require('../lib/db');
var TTS = require('watson-developer-cloud/text-to-speech/v1');

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

router.get('/say', (req, res, next) => {
  credentials = JSON.parse(process.env.VCAP_SERVICES).text_to_speech[0].credentials;
  var tts = new TTS({
    username: credentials.username,
    password: credentials.password
  });
  var params = {
    text: `Hello ${res.locals.current_participant.name}! Welcome to ${res.locals.current_event.name}!`,
    voice: 'en-US_AllisonVoice',
    accept: 'audio/wav'
  };
  var transcript = tts.synthesize(params);
  transcript.on('error', err => {
    next(err);
  });
  transcript.pipe(res);
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
