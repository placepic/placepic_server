const express = require('express');
const router = express.Router();
const uploads = require('../modules/multer');
const authUtils = require('../middlewares/auth');
const controller = require('../controllers/places');

router.get('/', authUtils.checkToken, controller.getAllPlaces);
router.get('/:placeIdx', controller.getPlace);
router.get('/group/:groupIdx', controller.getPlacesByGroup);
router.post('/', authUtils.checkToken, uploads.array('image'),controller.getAllPlaces);
router.post('/example',async (req,res)=>{
    const {tags,subway} = req.body;
    console.log(tags[0]);
    console.log(req.body);
})

module.exports = router;
