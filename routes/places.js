const express = require('express');
const router = express.Router();
const uploads = require('../modules/multer');
const authUtils = require('../middlewares/auth');
const controller = require('../controllers/places');

router.get('/', authUtils.checkToken, controller.getAllPlaces);
router.post('/like', authUtils.checkToken, controller.toggleLike);
router.get('/:placeIdx', authUtils.checkToken, controller.getPlace);
router.get('/group/:groupIdx', authUtils.checkToken, controller.getPlacesByGroup);
router.get('/search/group/:groupIdx', authUtils.checkToken, controller.getPlacesByQuery);
router.post('/', authUtils.checkToken, uploads.array('image'), controller.createPlace);
module.exports = router;
