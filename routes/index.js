var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).json({message:"Hello place.pic"})
});

router.use('/group', require('./group'));
router.use('/subway', require('./subway'));
router.use('/user', require('./auth'));
module.exports = router;
