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
router.post('/banners/:bannerIdx/place', authUtils.checkAdmin, controller.addPlacesToBanner);
router.delete('/banners/:bannerIdx/place/:placeIdx', authUtils.checkAdmin, controller.deletePlaceToBanner);
router.delete('/banners/:bannerIdx/place', authUtils.checkAdmin, controller.deletePlacesToBanner);


module.exports = router;