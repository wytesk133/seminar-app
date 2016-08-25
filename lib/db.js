var deasync = require('deasync');
var debug = require('debug')('seminar-app:db');
var cloudant = require('cloudant')(JSON.parse(process.env.VCAP_SERVICES).cloudantNoSQLDB[0].credentials.url);
var dbName = 'seminar_app';
var create = deasync(cloudant.db.create);
try {
  create(dbName);
} catch (err) {
  debug(err.message);
}
module.exports = cloudant.use(dbName);
