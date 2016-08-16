var express = require('express');
var router = express.Router();
var requireAuthentication = require('../../middlewares/requireAuthentication');

router.get('/', requireAuthentication, (req, res, next) => {
  res.send('It Works!');
});

module.exports = router;
