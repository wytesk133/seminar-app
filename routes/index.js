var router = require('express').Router();

router.get('/', (req, res, next) => {
  res.render('index', { title: 'Seminar' });
});

module.exports = router;
