var express = require('express');
var router = express.Router();
const userController = require('../controllers/users');
const groups = require('../controllers/groups');
const authUtil  = require('../middlewares/auth');

router.post('/checkemail', userController.checkEmail);
router.post('/signup', userController.signup);
router.post('/signin',  userController.signin);
router.get('/groups',authUtil.checkToken, groups.getMyGroupList); // 그룹신청 페이지에서 보여줘야 할것들
router.get('/groups/apply',authUtil.checkToken, groups.getMyApplyGroupList);

router.post('/groups/apply/:groupIdx',authUtil.checkToken, groups.apply); // 그룹신청할때

router.get('/groups/myInfo/:groupIdx',authUtil.checkToken, groups.getMyWaitUserList); // 관리자
router.put('/groups/edit/:groupIdx', groups.editStatusApplyUser);
router.delete('/groups/delete/:groupIdx', groups.deleteStatusApplyUser);


module.exports = router;