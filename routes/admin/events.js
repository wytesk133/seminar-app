var express = require('express');
var router = express.Router();
var db = require('../../lib/db');
var Event = require('../../models/event');
var Participant = require('../../models/participant');
var params = require('params');

router.use((req, res, next) => {
  res.locals.title = 'Event Management';
  if (req.body.event) {
    params(req.body.event).require('name', 'date');
    req.body.event = params(req.body.event).only('name', 'date', 'agenda');
  }
  if (req.body.participant) {
    params(req.body.participant).require('name');
    req.body.participant = params(req.body.participant).only('name', 'company', 'photo');
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
.post((req, res, next) => {
  event = new Event(req.body.event);
  event.save(err => {
    if (err) {
      res.render('admin/events/form', { event: event, error: 'Error saving: ' + err.message });
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
.post((req, res, next) => {
  res.locals.event.update(req.body.event, err => {
    if (err) {
      res.render('admin/events/form', { error: 'Error saving: ' + err.message });
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

module.exports = router;
