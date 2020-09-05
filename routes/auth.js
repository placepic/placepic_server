var express = require('express');
var router = express.Router();
const upload = require('../modules/multer');
const userController = require('../controllers/users');
const groups = require('../controllers/groups');
const admin = require('../controllers/admin');
const myInfo = require('../controllers/myInfo');
const authUtil = require('../middlewares/auth');

router.post('/checkemail', userController.checkEmail);
router.post('/signup', userController.signup);
router.post('/signin', userController.signin);

router.post('/certificate', userController.getCertificationNumber); // 인증번호 받기 (문자)
router.post('/test/signin', userController.signInSP3); // 인증번호 확인

router.get('/groups', authUtil.checkToken, groups.getMyGroupList); // 그룹신청 페이지에서 보여줘야 할것들
router.get('/groups/apply', authUtil.checkToken, groups.getMyApplyGroupList); //그룹 신청 가능 목록
router.post('/groups/apply', authUtil.checkToken, groups.apply); // 그룹신청할때
router.get('/groups/admin/:groupIdx', authUtil.checkToken, admin.getMyWaitUserList); // 관리자
router.put('/groups/admin/edit/:groupIdx', authUtil.checkToken, admin.editStatusApplyUser);
router.put('/myInfo/edit/:groupIdx', authUtil.checkToken, upload.single('profileImageUrl'), myInfo.editMyInfo);
router.delete('/groups/admin/delete/:groupIdx/:userIdx', authUtil.checkToken, admin.deleteStatusApplyUser);
router.get('/myInfo/:groupIdx', authUtil.checkToken, myInfo.getMyInfo); //만약 state가 2이면 못들어오게
router.get('/myInfo/places/:groupIdx', authUtil.checkToken, myInfo.getPlacesWithUser);
router.get('/groups/userlist/:groupIdx', authUtil.checkToken, groups.getMyGroupRanking);
module.exports = router;
