var Model = require('../lib/model');

class Event extends Model {
  static get typeName () { return 'event'; }
  static get designName () { return 'events'; }
}

module.exports = Event;
