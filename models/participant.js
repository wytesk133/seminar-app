var Model = require('../lib/model');

class Participant extends Model {
  static get typeName () { return 'participant'; }
  static get designName () { return 'participants'; }
}

module.exports = Participant;
