const express = require('express');
const router = express.Router();
const authUtils = require('../middlewares/auth');
const tagController = require('../controllers/tags');

router.get('/allTags', authUtils.checkToken, tagController.readAllTags);
router.get('/:categoryIdx',authUtils.checkToken, tagController.readCategoryTags);
router.get('/default/:categoryIdx',authUtils.checkToken, tagController.readCategoryDefaultTags);

module.exports = router;