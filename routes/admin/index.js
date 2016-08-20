var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
  res.render('admin/index', { title: 'Administration' });
});

router.use('/users', require('./users'));
router.use('/events', require('./events'));

module.exports = router;
