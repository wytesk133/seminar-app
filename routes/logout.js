var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
  delete req.session.current_user_id;
  delete req.session.current_participant_id;
  res.redirect(req.app.locals.root_path);
})

module.exports = router;
