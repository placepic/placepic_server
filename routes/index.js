var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).json({message:"Hello place.pic"})
});


router.use('/subway', require('./subway'));
router.use('/auth', require('./auth'));
router.use('/category', require('./category'));
router.use('/place', require('./places'));

module.exports = router;
