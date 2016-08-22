var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('event/index', { title: 'Seminar' });
});

module.exports = router;
