var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
  delete req.session.user;
  res.redirect(req.app.locals.root_path);
})

module.exports = router;
