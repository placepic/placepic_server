var express = require('express');
var router = express.Router();
const upload = require('../modules/multer');
const userController = require('../controllers/users');
const groups = require('../controllers/groups');
const admin = require('../controllers/admin');
const myInfo = require('../controllers/myInfo');
const authUtil = require('../middlewares/auth');

router.post('/checkemail', userController.checkEmail); //2
router.post('/signup', userController.signup); //2
router.post('/signin', userController.signin); //2

/** SP3 */
router.post('/certificate', userController.getCertificationNumber); // 인증번호 받기 (문자)
router.post('/sp3/signin', userController.signInSP3); // 인증번호 확인

router.get('/groups', authUtil.checkToken, groups.getMyGroupList); // 그룹신청 페이지에서 보여줘야 할것들
//router.get('/groups/apply', authUtil.checkToken, groups.getMyGroupList); //그룹 신청 가능 목록 //1
router.post('/groups/apply', authUtil.checkToken, groups.apply); // 그룹신청할때 수정필요
router.get('/groups/admin/:groupIdx', authUtil.checkToken, admin.getMyWaitUserList); // 관리자
//router.put('/groups/admin/edit/:groupIdx', authUtil.checkToken, admin.editStatusApplyUser); // 2
router.put('/myInfo/edit/:groupIdx', authUtil.checkToken, upload.single('profileImageUrl'), myInfo.editMyInfo); // 수정
router.delete('/groups/admin/delete/:groupIdx/:userIdx', authUtil.checkToken, admin.deleteStatusApplyUser); // 2
router.get('/myInfo/:groupIdx', authUtil.checkToken, myInfo.getMyInfo); //만약 state가 2이면 못들어오게 // 수정 // 바꿀꺼 없음.. profileUser이거 user테이블에서 삭제되면 바꾸기
router.get('/myInfo/places/:groupIdx', authUtil.checkToken, myInfo.getPlacesWithUser); // 수정 x
router.get('/groups/userlist/:groupIdx', authUtil.checkToken, groups.getMyGroupRanking); // 수정
module.exports = router;
