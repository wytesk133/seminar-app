var debug = require('debug')('seminar-app:db');
var db = require('./db');
var User = require('../models/user');
var async = require('async');

db.list({ limit: 0 }, (err, body) => {
  if (err) {
    debug(err);
  } else if (body.total_rows == 0) {
    async.series([
      callback => {
        debug('Populating database ...');
        callback(null);
      },
      callback => {
        // _design/users
        db.insert({
          views: {
            all: {
              map: function (doc) {
                if (doc.type == 'user') emit(doc._id, doc);
              }
            },
            username: {
              map: function (doc) {
                if (doc.type == 'user') emit(doc.username, doc);
              }
            }
          }
        }, '_design/users', callback);
      },
      callback => {
        // _design/events
        db.insert({
          views: {
            all: {
              map: function (doc) {
                if (doc.type == 'event') emit(doc._id, doc);
              }
            }
          }
        }, '_design/events', callback);
      },
      callback => {
        // _design/participants
        db.insert({
          views: {
            event_id: {
              map: function (doc) {
                if (doc.type == 'participant') emit(doc.event_id, doc);
              }
            }
          }
        }, '_design/participants', callback);
      },
      callback => {
        // root account
        new User({ full_name: "Administrator", username: "admin", password: "password" }).save(callback);
      }
    ], err => {
      if (err) {
        debug(err);
      } else {
        debug('Populating database ... DONE!');
      }
    });
  }
});
