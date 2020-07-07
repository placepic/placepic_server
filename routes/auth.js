var express = require('express');
var router = express.Router();
const userController = require('../controllers/users');
const groups = require('../controllers/groups');
const authUtil  = require('../middlewares/auth');

router.post('/signup', userController.signup);
router.post('/signin',  userController.signin);
router.get('/groups',authUtil.checkToken, groups.getMyGroupList);
router.post('/groups/:groupIdx/apply',authUtil.checkToken, groups.apply);
router.get('/groups/:groupIdx/myInfo',authUtil.checkToken, groups.getMyWaitUserList);
router.put('/groups/:groupIdx/edit', groups.editStatusApplyUser);
router.delete('/groups/:groupIdx/delete', groups.deleteStatusApplyUser);
module.exports = router;