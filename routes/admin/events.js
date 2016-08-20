var express = require('express');
var router = express.Router();
var Event = require('../../models/event');
var params = require('params');

router.use((req, res, next) => {
  res.locals.title = 'Event Management';
  if (req.body.event) {
    params(req.body.event).require('name', 'date');
    req.body.event = params(req.body.event).only('name', 'date', 'agenda');
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

// GET /events/:id
// show
router.get('/:id', (req, res, next) => {
  res.render('admin/events/show', { msg: req.flash('events_msg') });
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

module.exports = router;
