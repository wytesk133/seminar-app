var async = require('async');
var db = require('../lib/db');
var Model = require('../lib/model');

class WordCloudQ extends Model {
  static get typeName () { return 'wordCloudQ'; }
  static get designName () { return 'wordCloudQ'; }

  destroy (callback) {
    db.get('configurations', (err, body) => {
      if (err) {
        callback(err);
      } else {
        async.series([
          next => {
            if (body.current_wordcloud_id == this._id) {
              delete body.current_wordcloud_id;
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

module.exports = WordCloudQ;
