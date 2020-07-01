const express = require('express');
const router = express.Router();
const API = require('../modules/api');


router.get('/',API.subWayApi);
module.exports = router;
