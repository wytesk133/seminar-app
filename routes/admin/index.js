var router = require('express').Router();

router.get('/', (req, res, next) => {
  res.render('admin/index', { title: 'Administration' });
});

router.use('/users', require('./users'));
router.use('/events', require('./events'));
router.use('/participants', require('./participants'));
router.use('/wordclouds', require('./wordclouds'));

module.exports = router;
