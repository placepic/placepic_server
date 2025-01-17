const express = require('express');
const router = express.Router();
const uploads = require('../modules/multer');
const authUtils = require('../middlewares/auth');
const controller = require('../controllers/places');

router.get('/', authUtils.checkToken, controller.getAllPlaces);
router.post('/like', authUtils.checkToken, controller.addLike);
router.get('/bookmark/group/:groupIdx', authUtils.checkToken, controller.getPlacesWithBookmark);
router.post('/bookmark', authUtils.checkToken, controller.addBookmark);
router.delete('/bookmark/:placeIdx', authUtils.checkToken, controller.deleteBookmark);
router.delete('/like/:placeIdx', authUtils.checkToken, controller.deleteLike);
router.get('/like/:placeIdx', authUtils.checkToken, controller.getLikeList);
router.get(
    '/:placeIdx/group/:groupIdx/comment',
    authUtils.checkToken,
    controller.getCommentsByPlaceIdx
);
router.get('/:placeIdx', authUtils.checkToken, controller.getOnePlace);
router.post('/:placeIdx/group/:groupIdx/comment', authUtils.checkToken, controller.createComment);
router.delete('/:placeIdx/comment/:commentIdx', authUtils.checkToken, controller.deleteComment);
router.get('/group/:groupIdx', authUtils.checkToken, controller.getPlacesByGroup);
router.get('/group/:groupIdx/banner', authUtils.checkToken, controller.getBannerList);
router.get('/group/:groupIdx/banner/:bannerIdx', authUtils.checkToken, controller.getBannerPlaces);
router.get('/home/:groupIdx', authUtils.checkToken, controller.getPlacesAtHome);
router.get('/home/page/:groupIdx', authUtils.checkToken, controller.getPlacesAtHomeByPage);
router.get('/search/group/:groupIdx', authUtils.checkToken, controller.getPlacesByQuery);
router.post('/', authUtils.checkToken, uploads.array('image'), controller.addPlace);
router.delete('/:placeIdx', authUtils.checkToken, controller.deletePlace);

module.exports = router;
