var router = require('express').Router();
var async = require('async');
var params = require('params');
var db = require('../../lib/db');
var WordCloudQ = require('../../models/wordcloudQ');
var Event = require('../../models/event');

router.use((req, res, next) => {
  res.locals.title = 'Word Cloud Management';
  if (req.body.wordcloud) {
    params(req.body.wordcloud).require('question', 'event_id');
    // TODO: sanitize event_id
    req.body.wordcloud = params(req.body.wordcloud).only('question', 'event_id');
  }
  Event.all(events => {
    res.locals.events = events;
    next();
  });
});

// GET /wordclouds
// index
router.get('/', (req, res, next) => {
  WordCloudQ.all(wordclouds => {
    async.each(wordclouds, (wordcloud, callback) => {
      wordcloud.event(event => {
        if (event) {
          wordcloud.event = event;
          callback();
        } else {
          callback(new Error('Participant list: Event not found'));
        }
      });
    }, err => {
      if (err) {
        next(err);
      } else {
        res.render('admin/wordclouds/index', { wordclouds: wordclouds, msg: req.flash('wordclouds_msg') });
      }
    });
  });
});

// GET /wordclouds/new
// new
// POST /wordclouds/new
// create
router.route('/new')
.all((req, res, next) => {
  res.locals.mode = 'new';
  next();
})
.get((req, res, next) => {
  res.render('admin/wordclouds/form', { wordcloud: {} });
})
.post((req, res, next) => {
  wordcloud = new WordCloudQ(req.body.wordcloud);
  wordcloud.save(err => {
    if (err) {
      res.render('admin/wordclouds/form', { wordcloud: wordcloud, error: 'Error saving: ' + err.message });
    } else {
      req.flash('wordclouds_msg');
      req.flash('wordclouds_msg', 'Wordcloud created');
      res.redirect(req.app.locals.wordcloud_path(wordcloud));
    }
  });
});

// GET /wordclouds/clear
// set current_wordcloud to null
router.get('/clear', (req, res, next) => {
  delete res.locals.configurations.current_wordcloud_id;
  db.insert(res.locals.configurations, err => {
    if (err) {
      next(err);
    } else {
      res.redirect(req.app.locals.wordclouds_path);
    }
  });
});

// GET /wordclouds/:id
// show
router.get('/:id', (req, res, next) => {
  res.render('admin/wordclouds/show', { msg: req.flash('wordclouds_msg') });
});

// GET /wordclouds/:id/edit
// edit
// POST /wordclouds/:id/edit
// update
router.route('/:id/edit')
.all((req, res, next) => {
  res.locals.mode = 'edit';
  next();
})
.get((req, res, next) => {
  res.render('admin/wordclouds/form');
})
.post((req, res, next) => {
  res.locals.wordcloud.update(req.body.wordcloud, err => {
    if (err) {
      res.render('admin/wordclouds/form', { error: 'Error saving: ' + err.message });
    } else {
      req.flash('wordclouds_msg');
      req.flash('wordclouds_msg', 'Wordcloud updated');
      res.redirect(req.app.locals.wordcloud_path(res.locals.wordcloud));
    }
  });
});

// GET /wordclouds/:id/delete
// confirm destroy
// POST /wordclouds/:id/delete
// destroy
router.route('/:id/delete')
.get((req, res, next) => {
  res.render('admin/wordclouds/delete');
})
.post((req, res, next) => {
  res.locals.wordcloud.destroy(err => {
    if (err) {
      req.flash('wordclouds_msg')
      req.flash('wordclouds_msg', 'Wordcloud NOT deleted')
      res.redirect(req.app.locals.wordcloud_path(res.locals.wordcloud));
    } else {
      req.flash('wordclouds_msg');
      req.flash('wordclouds_msg', 'Wordcloud deleted');
      res.redirect(req.app.locals.wordclouds_path);
    }
  });
});

// GET /wordclouds/:id/use
// set current word cloud
router.get('/:id/use', (req, res, next) => {
  res.locals.configurations.current_wordcloud_id = res.locals.wordcloud._id;
  db.insert(res.locals.configurations, err => {
    if (err) {
      next(err);
    } else {
      res.redirect(req.app.locals.wordclouds_path);
    }
  });
});

// parse word cloud id
router.param('id', (req, res, next, id) => {
  WordCloudQ.find(id, wordcloud => {
    if (wordcloud) {
      res.locals.wordcloud = wordcloud;
      Event.find(wordcloud.event_id, event => {
        if (event) {
          wordcloud.event = event;
          next();
        } else {
          next(new Error('Wordcloud: Event not found'));
        }
      });
    } else {
      next(new Error('Wordcloud not found'));
    }
  });
});

module.exports = router;
