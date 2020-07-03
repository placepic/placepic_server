const express = require('express');
const router = express.Router();

const authUtils = require('../middlewares/auth');

const controller = require('../controllers/search');

router.get('/place/:groupIdx', authUtils.checkToken, controller.searchPlaceWithNaverAPI);

module.exports = router;