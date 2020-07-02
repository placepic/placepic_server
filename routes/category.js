const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category');
const checkToken = require('../middlewares/auth').checkToken;

router.get('/', checkToken ,categoryController.readCategory);

module.exports = router;
