var cloudant = require('cloudant')(JSON.parse(process.env.VCAP_SERVICES).cloudantNoSQLDB[0].credentials.url);
var dbName = 'seminar_app';
cloudant.db.create(dbName); // create if not existed
module.exports = cloudant.use(dbName);
