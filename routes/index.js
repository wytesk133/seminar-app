var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.locals.participant = req.session.current_participant_id
  res.render('index', { title: 'Express' });
});

module.exports = router;
