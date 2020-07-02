const express = require('express');
const router = express.Router();
const subwayController = require('../controllers/subway');
const authUtils = require('../middlewares/auth');

router.get('/',authUtils.checkToken,subwayController.readStation);

module.exports = router;
