const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category');
const authUtils = require('../middlewares/auth');

router.get('/', authUtils.checkToken ,categoryController.readCategory);
router.get('/all', authUtils.checkToken,categoryController.readAllCategoryTagData)
router.get('/:categoryIdx', authUtils.checkToken ,categoryController.readOneCategory);
module.exports = router;

