const express = require('express');
const router = express.Router();

const authUtils = require('../middlewares/auth');
const controller = require('../controllers/appAdmin');

router.get('/banners', authUtils.checkAdmin, controller.getBannerList);
router.get('/banners/:bannerIdx', authUtils.checkAdmin, controller.getBanner);

module.exports = router;