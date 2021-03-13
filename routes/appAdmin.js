const express = require('express');
const router = express.Router();

const authUtils = require('../middlewares/auth');
const controller = require('../controllers/appAdmin');
const placeController = require('../controllers/places');

router.get('/banners', authUtils.checkAdmin, controller.getBannerList);
router.get('/banners/:bannerIdx', authUtils.checkAdmin, controller.getBannerPlaces);
router.post('/banners', authUtils.checkAdmin, controller.addBanner);
router.delete('/banners/:bannerIdx', authUtils.checkAdmin, controller.deleteBanner);
router.post('/banners/:bannerIdx/place/:placeIdx', authUtils.checkAdmin, controller.addPlaceToBanner);
router.delete('/banners/:bannerIdx/place/:placeIdx', authUtils.checkAdmin, controller.deletePlaceToBanner);


module.exports = router;