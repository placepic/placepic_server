var express = require('express');
var router = express.Router();
const userController = require('../controllers/users');
const groups = require('../controllers/groups');
const authUtil  = require('../middlewares/auth').checkToken;

router.post('/signup', userController.signup);
router.post('/signin',  userController.signin);
router.get('/groups',authUtil.checkToken, groups.getMyGroupList);
router.post('/groups/:groupIdx/apply',authUtil.checkToken, groups.apply);
module.exports = router;