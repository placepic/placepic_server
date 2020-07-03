const express = require('express');
const router = express.Router();
const authUtils = require('../middlewares/auth');
const searchController = require('../controllers/search');


router.get('/place/:groupIdx', authUtils.checkToken, searchController.apiSearch );

module.exports = router;
