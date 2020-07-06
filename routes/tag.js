const express = require('express');
const router = express.Router();
const authUtils = require('../middlewares/auth');
const tagController = require('../controllers/tags');

router.get('/:categoryIdx',authUtils.checkToken, tagController.getCategoryTags);
router.get('/:categoryIdx/default',authUtils.checkToken, tagController.getCategoryDefaultTags);

module.exports = router;