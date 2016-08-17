var db = require('../lib/db');

class Model {
  constructor (obj) {
    for (var prop in obj) {
      this[prop] = obj[prop];
    }
  }

  save (callback) {
    if (this._id) {
      db.update(this, (err, body) => {
        if (!err) {
          this._rev = body._rev;
        }
        callback(err);
      });
    } else {
      db.insert(this, (err, body) => {
        if (!err) {
          this._id = body.id;
          this._rev = body._rev;
        }
        callback(err);
      });
    }
  }

  static find (id, callback) {
    db.get(id, (err, body) => {
      if (err) {
        callback(false);
      } else {
        callback(new this(body));
      }
    });
  }
  static find_by (field, query, callback) {
    db.view(this.designName, field, { keys: [ query ], limit: 1 }, (err, body) => {
      if (err || body.rows.length == 0) {
        callback(false);
      } else {
        callback(new this(body.rows[0].value));
      }
    });
  }
}

module.exports = Model;
