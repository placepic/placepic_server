var express = require('express');
var router = express.Router();
const userController = require('../controllers/users');
const groups = require('../controllers/groups');
const authUtil  = require('../middlewares/auth');

router.get('/checkemail', userController.checkEmail);
router.post('/signup', userController.signup);
router.post('/signin',  userController.signin);
router.get('/groups',authUtil.checkToken, groups.getMyGroupList);
router.post('/groups/apply/:groupIdx',authUtil.checkToken, groups.apply);
router.get('/groups/myInfo/:groupIdx',authUtil.checkToken, groups.getMyWaitUserList);
router.put('/groups/edit/:groupIdx', groups.editStatusApplyUser);
router.delete('/groups/delete/:groupIdx', groups.deleteStatusApplyUser);
module.exports = router;