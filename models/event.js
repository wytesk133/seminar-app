var async = require('async');
var db = require('../lib/db');
var Model = require('../lib/model');

class Event extends Model {
  static get typeName () { return 'event'; }
  static get designName () { return 'events'; }

  save (callback) {
    // parse date
    var date = new Date(this.date);
    var y = date.getFullYear();
    var m = date.getMonth();
    m ++;
    if (m < 10) m = '0' + m;
    var d = date.getDate();
    if (d < 10) d = '0' + d;
    this.date =  `${y}-${m}-${d}`;
    super.save(callback);
  }

  destroy (callback) {
    db.get('configurations', (err, body) => {
      if (err) {
        callback(err);
      } else {
        async.series([
          next => {
            if (body.current_event_id == this._id) {
              delete body.current_event_id;
              db.insert(body, next);
            } else {
              next();
            }
          }
        ], err => {
          if (err) callback(err);
          else super.destroy(callback);
        });
      }
    });
  }
}

module.exports = Event;
