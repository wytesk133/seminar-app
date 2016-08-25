var db = require('../lib/db');
var async = require('async');

class Model {
  constructor (obj) {
    this.type = this.constructor.typeName;
    for (var prop in obj) {
      this[prop] = obj[prop];
    }
  }

  save (callback) {
    this.updated_at = Date.now();
    if (!this._id) {
      this.created_at = Date.now();
    }
    db.insert(this, (err, body) => {
      if (!err) {
        this._id = body.id;
        this._rev = body.rev;
      }
      callback(err);
    });
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
      if (err || body.type != this.typeName) {
        callback();
      } else {
        callback(new this(body));
      }
    });
  }

  static findBy (field, query, callback) {
    db.view(this.designName, field, { keys: [ query ], limit: 1 }, (err, body) => {
      if (err || body.rows.length == 0) {
        callback();
      } else {
        callback(new this(body.rows[0].value));
      }
    });
  }

  static hasMany (childClass, destroyDependents) {
    // not using 'lexical this'
    this.prototype[childClass.designName] = function (callback) {
      db.view(childClass.designName, `${this.constructor.typeName}_id`, { keys: [ this._id ] }, (err, body) => {
        var result = [];
        if (!err) {
          body.rows.forEach(item => {
            result.push(new childClass(item.value));
          });
        }
        callback(result);
      });
    };
    if (destroyDependents) {
      var old = this.prototype.destroy;
      this.prototype.destroy = function (callback) {
        this[childClass.designName](items => {
          async.each(items, (item, next) => {
            item.destroy(next);
          }, err => {
            if (err) {
              callback(err);
            } else if (old) {
              old.call(this, callback);
            } else {
              callback();
            }
          });
        });
      };
    }
  }

  static belongsTo (parentClass) {
    // not using 'lexical this'
    this.prototype[parentClass.typeName] = function (callback) {
      parentClass.find(this[`${parentClass.typeName}_id`], callback);
    };
  }
}

module.exports = Model;
