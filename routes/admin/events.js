var router = require('express').Router();
var db = require('../../lib/db');
var Event = require('../../models/event');
var Participant = require('../../models/participant');
var params = require('params');
var async = require('async');
var multer = require('multer');
var upload = multer({ storage: multer.memoryStorage() });
var Zip = require('jszip');
var qr = require('qr-image');
var streamToBuffer = require('stream-to-buffer');

router.use((req, res, next) => {
  res.locals.title = 'Event Management';
  if (req.body.event) {
    params(req.body.event).require('name', 'date');
    req.body.event = params(req.body.event).only('name', 'date', 'agenda');
  }
  if (req.body.participant) {
    params(req.body.participant).require('name');
    req.body.participant = params(req.body.participant).only('name', 'position', 'company');
  }
  next();
});

// GET /events
// index
router.get('/', (req, res, next) => {
  Event.all(events => {
    res.render('admin/events/index', { events: events, msg: req.flash('events_msg') });
  });
});

// GET /events/new
// new
// POST /events/new
// create
router.route('/new')
.all((req, res, next) => {
  res.locals.mode = 'new';
  next();
})
.get((req, res, next) => {
  res.render('admin/events/form', { event: {} });
})
.post(upload.single('agenda'), (req, res, next) => {
  event = new Event(req.body.event);
  event.save(err => {
    if (err) {
      res.render('admin/events/form', { event: event, error: 'Error saving: ' + err.message });
    } else if (req.file) {
      db.attachment.insert(event._id, 'agenda.pdf', req.file.buffer, 'application/pdf', { rev: event._rev }, (err, body) => {
        if (err) next(err);
        else {
          req.flash('events_msg');
          req.flash('events_msg', 'Event updated');
          res.redirect(req.app.locals.event_path(event));
        }
      });
    } else {
      req.flash('events_msg');
      req.flash('events_msg', 'Event created');
      res.redirect(req.app.locals.event_path(event));
    }
  });
});

// GET /events/clear
// set current_event to null
router.get('/clear', (req, res, next) => {
  delete res.locals.configurations.current_event_id;
  db.insert(res.locals.configurations, err => {
    if (err) {
      next(err);
    } else {
      res.redirect(req.app.locals.events_path);
    }
  });
});

// GET /events/:id
// show
router.get('/:id', (req, res, next) => {
  res.locals.event.participants(participants => {
    participants.sort((a, b) => {
      if (a.created_at < b.created_at) return -1;
      if (a.created_at > b.created_at) return 1;
      return 0;
    });
    res.render('admin/events/show', {
      msg: req.flash('events_msg'),
      participants: participants,
      participants_msg: req.flash('participants_msg')
    });
  });
});

// GET /events/:id/edit
// edit
// POST /events/:id/edit
// update
router.route('/:id/edit')
.all((req, res, next) => {
  res.locals.mode = 'edit';
  next();
})
.get((req, res, next) => {
  res.render('admin/events/form');
})
.post(upload.single('agenda'), (req, res, next) => {
  var event = res.locals.event;
  event.update(req.body.event, err => {
    if (err) {
      res.render('admin/events/form', { error: 'Error saving: ' + err.message });
    } else if (req.file) {
      db.attachment.insert(event._id, 'agenda.pdf', req.file.buffer, 'application/pdf', { rev: event._rev }, (err, body) => {
        if (err) next(err);
        else {
          req.flash('events_msg');
          req.flash('events_msg', 'Event updated');
          res.redirect(req.app.locals.event_path(res.locals.event));
        }
      });
    } else {
      req.flash('events_msg');
      req.flash('events_msg', 'Event updated');
      res.redirect(req.app.locals.event_path(res.locals.event));
    }
  });
});

// GET /events/:id/delete
// confirm destroy
// POST /events/:id/delete
// destroy
router.route('/:id/delete')
.get((req, res, next) => {
  res.render('admin/events/delete');
})
.post((req, res, next) => {
  if (res.locals.configurations.current_event_id == res.locals.event._id) {
    delete res.locals.configurations.current_event_id;
  }
  res.locals.event.destroy(err => {
    if (err) {
      req.flash('events_msg')
      req.flash('events_msg', 'Event NOT deleted')
      res.redirect(req.app.locals.event_path(res.locals.event));
    } else {
      req.flash('events_msg');
      req.flash('events_msg', 'Event deleted');
      res.redirect(req.app.locals.events_path);
    }
  });
});

// GET /events/:id/use
// set current event
router.get('/:id/use', (req, res, next) => {
  res.locals.configurations.current_event_id = res.locals.event._id;
  db.insert(res.locals.configurations, err => {
    if (err) {
      next(err);
    } else {
      res.redirect(req.app.locals.events_path);
    }
  });
});

// GET /events/:id/agenda
router.get('/:id/agenda', (req, res, next) => {
  db.attachment.get(res.locals.event._id, 'agenda.pdf', (err, body) => {
    if (err) next(err);
    else {
      res.set('Content-Type', 'application/pdf');
      res.send(body);
    }
  });
});

// GET /events/:id/qr
router.get('/:id/qr', (req, res, next) => {
  var zip = new Zip();
  res.locals.event.participants(participants => {
    async.each(participants, (participant, next) => {
      var stream = qr.image(`https://seminar-app.mybluemix.net/enter/${participant.token}`, { type: 'png' });
      streamToBuffer(stream, (err, buffer) => {
        name = participant.name.replace(' ', '_').replace(/[^A-Za-z_]/g, '');
        zip.file(`${name}_${participant.token}.png`, buffer);
        next();
      })
    }, err => {
      if (err) {
        next(err);
      } else {
        zip.generateAsync({ type: 'nodebuffer'})
        .then(content => {
          res.set('Content-Type', 'application/zip');
          res.send(content);
        });
      }
    });
  });
});

// GET /events/:id/clear
router.get('/:id/clear', (req, res, next) => {
  res.locals.event.participants(participants => {
    async.each(participants, (participant, next) => {
      delete participant.entered;
      participant.save(next);
    }, err => {
      if (err) {
        next(err);
      } else {
        res.redirect(req.app.locals.event_path(res.locals.event));
      }
    });
  });
});

// parse event id
router.param('id', (req, res, next, id) => {
  Event.find(id, event => {
    if (event) {
      res.locals.event = event;
      next();
    } else {
      next(new Error('Event not found'));
    }
  });
});

// GET /events/:id/add
// new
// POST /events/:id/add
// create
router.route('/:id/add')
.all((req, res, next) => {
  res.locals.title = 'Participant Management';
  res.locals.mode = 'new';
  next();
})
.get((req, res, next) => {
  res.render('admin/participants/form', { participant: {} });
})
.post((req, res, next) => {
  participant = new Participant(req.body.participant);
  participant.event_id = res.locals.event._id;
  require('crypto').randomBytes(4, (err, buffer) => {
    if (err) {
      res.render('admin/participants/form', { participant: participant, error: 'Error saving: ' + err.message });
    } else {
      participant.token = buffer.toString('hex');
      participant.save(err => {
        if (err) {
          res.render('admin/participants/form', { participant: participant, error: 'Error saving: ' + err.message });
        } else {
          req.flash('participants_msg');
          req.flash('participants_msg', 'Participant created');
          res.redirect(req.app.locals.participant_path(participant));
        }
      });
    }
  });
});

// GET /events/:id/import
// bulk new
// POST /events/:id/import
// bulk create
router.route('/:id/import')
.get((req, res, next) => {
  res.locals.title = 'Participant Management';
  res.render('admin/participants/import');
})
.post((req, res, next) => {
  var count = 0;
  async.eachSeries(req.body.input.split('\n'), (line, callback) => {
    try {
      var data = JSON.parse(line);
    } catch (err) {
      // skip
      return callback(null);
    }
    participant = new Participant({ name: data[0], position: data[1], company: data[2] });
    participant.event_id = res.locals.event._id;
    require('crypto').randomBytes(4, (err, buffer) => {
      if (err) {
        callback(err);
      } else {
        participant.token = buffer.toString('hex');
        participant.save(err => {
          if (err) {
            callback(err);
          } else {
            count ++;
            callback(null);
          }
        });
      }
    });
  }, err => {
    if (err) {
      next(err);
    } else {
      req.flash('participants_msg');
      req.flash('participants_msg', `${count} participant(s) created`);
      res.redirect(req.app.locals.event_path(res.locals.event));
    }
  });
});

router.route('/:id/questionnaire')
.get((req, res, next) => {
  res.locals.questionnaire = JSON.stringify(res.locals.event.questionnaire || []);
  res.render('admin/events/questionnaire', { title: 'Questionnaire' });
})
.post((req, res, next) => {
  // TODO: recursive sanitize
  res.locals.event.questionnaire = JSON.parse(req.body.questionnaire);
  res.locals.event.save(err => {
    if (err) next(err);
    else {
      req.flash('events_msg');
      req.flash('events_msg', 'Questionnaire updated');
      res.redirect(req.app.locals.event_path(res.locals.event));
    }
  });
});

module.exports = router;
