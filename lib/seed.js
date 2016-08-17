var debug = require('debug')('seminar-app:db');
var db = require('./db');
var User = require('../models/user');

var handleError = err => {
  if (err) {
    debug(err);
  }
};

db.list({ limit: 0 }, (err, body) => {
  if (err) {
    debug(err);
  } else if (body.total_rows == 0) {
    debug('Populating database ...');
    // _design/users
    db.insert({
      views: {
        username: {
          map: function (doc) {
            if (doc.type == 'user') emit(doc.username, doc);
          }
        }
      }
    }, '_design/users', handleError);
    // root account
    new User({ name: "Administrator", username: "admin", password: "password" }).save(handleError);
  }
});
