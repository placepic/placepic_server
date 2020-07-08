const express = require('express');
const router = express.Router();
const uploads = require('../modules/multer');
const authUtils = require('../middlewares/auth');
const controller = require('../controllers/places');

router.get('/', authUtils.checkToken, controller.getAllPlaces);
router.get('/:placeIdx', authUtils.checkToken, controller.getPlace);
router.get('/group/:groupIdx', authUtils.checkToken, controller.getPlacesByGroup);
router.get('/search/group/:groupIdx', authUtils.checkToken, controller.getPlacesByQuery);
router.post('/', authUtils.checkToken, uploads.array('image'), controller.createPlace);
//router.post('/', authUtils.checkToken,controller.createPlace);
router.post('/example',async (req,res)=>{
    const {tags,subway} = req.body;
    console.log(tags[0]);
    console.log(req.body);
})

module.exports = router;
