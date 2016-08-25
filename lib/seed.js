var debug = require('debug')('seminar-app:db');
var db = require('./db');
var User = require('../models/user');
var deasync = require('deasync');
var list = deasync(db.list);
var insert = deasync(db.insert);

try {
  var body = list({ limit: 0 });
  if (body.total_rows == 0) {
    debug('Populating database ...');
    // configurations
    insert({}, 'configurations');
    // _design/users
    insert({
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
    }, '_design/users');
    // _design/events
    insert({
      views: {
        all: {
          map: function (doc) {
            if (doc.type == 'event') emit(doc._id, doc);
          }
        }
      }
    }, '_design/events');
    // _design/participants
    insert({
      views: {
        event_id: {
          map: function (doc) {
            if (doc.type == 'participant') emit(doc.event_id, doc);
          }
        },
        token: {
          map: function (doc) {
            if (doc.type == 'participant') emit(doc.token, doc);
          }
        }
      }
    }, '_design/participants');
    // _design/wordCloudQ
    insert({
      views: {
        all: {
          map: function (doc) {
            if (doc.type == 'wordCloudQ') emit(doc._id, doc);
          }
        },
        event_id: {
          map: function (doc) {
            if (doc.type == 'wordCloudQ') emit(doc.event_id, doc);
          }
        }
      }
    }, '_design/wordCloudQ');
    // _design/wordCloudA
    insert({
      views: {
        participant_id: {
          map: function (doc) {
            if (doc.type == 'wordCloudA') emit(doc.participant_id, doc);
          }
        }
      }
    }, '_design/wordCloudA');
    // root account
    var root = new User({ full_name: "Administrator", username: "admin", password: "password" });
    deasync(root.save.bind(root))();
    debug('Populating database ... DONE!');
  }
} catch (err) {
  debug(err);
}
