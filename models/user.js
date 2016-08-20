var Model = require('../lib/model');
var bcrypt = require('bcryptjs');

class User extends Model {
  static get typeName () { return 'user'; }
  static get designName () { return 'users'; }

  save (callback) {
    // username duplication check
    this.constructor.findBy('username', this.username, user => {
      if (user && this._id != user._id) {
        callback(new Error('This username is not available'));
      } else {
        this._updatePassword(err => {
          if (err) callback(err);
          else super.save(callback);
        });
      }
    });
  }

  _updatePassword (callback) {
    if (this.password) {
      if (this.password_confirmation) {
        if (this.password != this.password_confirmation) {
          return callback(new Error('Password confirmation does not match'));
        } else {
          delete this.password_confirmation;
        }
      }
      bcrypt.hash(this.password, 10, (err, hash) => {
        if (err) callback(err);
        else {
          this.hashed_password = hash;
          delete this.password;
          callback(null);
        }
      });
    } else {
      callback(null);
    }
  }

  authenticate (password, callback) {
    bcrypt.compare(password, this.hashed_password, (err, res) => {
      if (!err && res) callback(true);
      else callback(false);
    });
  }
}

module.exports = User;
