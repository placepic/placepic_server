const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category');
const authUtils = require('../middlewares/auth');

router.get('/', authUtils.checkToken ,categoryController.readCategory);

module.exports = router;
