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
}

module.exports = Event;
