var router = require('express').Router();
var db = require('../lib/db');
var TTS = require('watson-developer-cloud/text-to-speech/v1');
var WordCloudA = require('../models/wordCloudA');

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
.all((req, res, next) => {
  if (!res.locals.current_event.questionnaire || !res.locals.current_event.questionnaire_enabled || res.locals.current_participant.questionnaire) {
    res.redirect(req.app.locals.event_page_path);
  } else {
    next();
  }
})
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

router.route('/wordcloud')
.all((req, res, next) => {
  if (res.locals.current_wordcloud) {
    next();
  } else {
    res.redirect(req.app.locals.event_page_path);
  }
})
.get((req, res, next) => {
  res.locals.current_participant.wordCloudA(answers => {
    res.render('event/wordcloud', { answers: answers.filter(answer => answer.wordCloudQ_id == res.locals.current_wordcloud._id) });
  });
})
.post((req, res, next) => {
  // TODO: sanitize
  new WordCloudA({
    wordCloudQ_id: res.locals.current_wordcloud._id,
    participant_id: res.locals.current_participant._id,
    word: req.body.word.toString()
  }).save(err => {
    if (err) next(err);
    else res.end();
  });
});

module.exports = router;
