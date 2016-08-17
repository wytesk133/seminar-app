var Model = require('../lib/model');
var bcrypt = require('bcryptjs');

class User extends Model {
  static get designName () { return 'users'; }

  constructor (obj) {
    if (obj.password) {
      obj.hashed_password = bcrypt.hashSync(obj.password);
      delete obj.password;
    }
    obj.type = 'user';
    super(obj);
  }

  updatePassword (plainText) {
    this.hashed_password = bcrypt.hashSync(plainText);
  }

  static authenticate (username, password, callback) {
    this.find_by('username', username, user => {
      if (!user) return callback(false);
      bcrypt.compare(password, user.hashed_password, (err, res) => {
        if (!err && res) callback(user);
        else callback(false);
      });
    });
  }
}

module.exports = User;
