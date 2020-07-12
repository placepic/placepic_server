var express = require('express');
var router = express.Router();
const userController = require('../controllers/users');
const groups = require('../controllers/groups');
const authUtil  = require('../middlewares/auth');

router.post('/checkemail', userController.checkEmail);
router.post('/signup', userController.signup);
router.post('/signin',  userController.signin);
router.get('/groups',authUtil.checkToken, groups.getMyGroupList); // 그룹신청 페이지에서 보여줘야 할것들
router.get('/groups/apply',authUtil.checkToken, groups.getMyApplyGroupList); //그룹 신청 가능 목록

router.post('/groups/apply/:groupIdx',authUtil.checkToken, groups.apply); // 그룹신청할때

router.get('/groups/admin/:groupIdx',authUtil.checkToken, groups.getMyWaitUserList); // 관리자
router.put('/groups/admin/edit/:groupIdx', groups.editStatusApplyUser);
router.delete('/groups/admin/delete/:groupIdx', groups.deleteStatusApplyUser);

//router.get('/myInfo/:groupIdx')


module.exports = router;