var db = require('../lib/db');

class Model {
  constructor (obj) {
    this.type = this.constructor.typeName;
    for (var prop in obj) {
      this[prop] = obj[prop];
    }
  }

  save (callback) {
    if (this._id) {
      db.insert(this, (err, body) => {
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

  update (obj, callback) {
    for (var prop in obj) {
      this[prop] = obj[prop];
    }
    this.save(callback);
  }

  destroy (callback) {
    db.destroy(this._id, this._rev, (err, body) => {
      callback(err);
    });
  }

  static all (callback) {
    db.view(this.designName, 'all', (err, body) => {
      var result = [];
      if (!err) {
        body.rows.forEach(item => {
          result.push(new this(item.value));
        });
      }
      callback(result);
    });
  }

  static find (id, callback) {
    db.get(id, (err, body) => {
      if (err) {
        callback(null);
      } else {
        callback(new this(body));
      }
    });
  }

  static findBy (field, query, callback) {
    db.view(this.designName, field, { keys: [ query ], limit: 1 }, (err, body) => {
      if (err || body.rows.length == 0) {
        callback(null);
      } else {
        callback(new this(body.rows[0].value));
      }
    });
  }
}

module.exports = Model;
