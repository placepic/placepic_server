const express = require('express');
const router = express.Router();
const uploads = require('../modules/multer');
const authUtils = require('../middlewares/auth');
const controller = require('../controllers/places');

router.get('/', authUtils.checkToken, controller.getAllPlaces);
router.post('/like', authUtils.checkToken, controller.addLike);
router.post('/bookmark', authUtils.checkToken, controller.addBookmark);
router.delete('/bookmark/:placeIdx', authUtils.checkToken, controller.deleteBookmark)
router.delete('/like/:placeIdx', authUtils.checkToken, controller.deleteLike);
router.get('/like/:placeIdx', authUtils.checkToken, controller.getLikeList);
//router.get('/:placeIdx', authUtils.checkToken, controller.getPlace);
router.get('/:placeIdx', authUtils.checkToken, controller.getOnePlace);
router.get('/group/:groupIdx', authUtils.checkToken, controller.getPlacesByGroup);
router.get('/search/group/:groupIdx', authUtils.checkToken, controller.getPlacesByQuery);
router.post('/', authUtils.checkToken, uploads.array('image'), controller.createPlace);
router.delete('/:placeIdx',authUtils.checkToken, controller.deletePlace);
module.exports = router;
