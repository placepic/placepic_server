let responseMessage = require('../modules/responseMessage');
let statusCode = require('../modules/statusCode');
let util = require('../modules/util');
let Group = require('../models/group');

module.exports = {
    apply: async (req, res) => {
        const userIdx = req.userIdx;
        const { groupIdx, userName, part } = req.body;

        const groupInfo = await Group.callMygroupInfo(groupIdx);

        try {
            //null 값 확인
            if (!groupIdx || !userIdx || !part || !userName) {
                console.log('필요한 값이 없습니다.');
                return res
                    .status(statusCode.BAD_REQUEST)
                    .send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
            }
            //1. 해당그룹이존재하는지
            if (!(await Group.checkGroupIdx(groupIdx))) {
                console.log('해당그룹이 존재하지 않습니다.');
                return res
                    .status(statusCode.BAD_REQUEST)
                    .send(util.fail(statusCode.BAD_REQUEST, responseMessage.CALL_GROUP_FAIL));
            }

            //2. 이미 신청한 그룹인지
            if (!(await Group.checkAlreadyGroup(userIdx, groupIdx))) {
                console.log('이미 가입된 그룹입니다.');
                return res
                    .status(statusCode.BAD_REQUEST)
                    .send(util.fail(statusCode.BAD_REQUEST, responseMessage.ALREADY_GROUP_USER));
            }
            const addPartResult = await Group.apply({ userIdx, groupIdx, userName, part });
            //성공

            return res.status(statusCode.OK).send(
                util.success(statusCode.OK, responseMessage.apply_SUCCESS, {
                    groupName: groupInfo[0].groupName,
                })
            );
        } catch (err) {
            console.log('apply error', err);
            return res
                .status(statusCode.INTERNAL_SERVER_ERROR)
                .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, err.message));
        }
    },
    getMyGroupList: async (req, res) => {
        try {
            const result = await Group.getMyGroupList(req.userIdx);
            return res
                .status(statusCode.OK)
                .send(util.success(statusCode.OK, responseMessage.CALL_GROUP_LIST, result));
        } catch (e) {
            console.log('getMyGroupList error :', e);
            return res
                .status(statusCode.INTERNAL_SERVER_ERROR)
                .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, e.message));
        }
    },
    getMyGroupRanking: async (req, res) => {
        try {
            const userIdx = req.userIdx;
            const groupIdx = req.params.groupIdx;
            const page = req.query.page;

            const result = await Group.getMyGroupRanking(groupIdx);
            const userCnt = await Group.getGroupUserCnt(groupIdx);
            return res.status(statusCode.OK).send(
                util.success(statusCode.OK, responseMessage.CALL_MYGROUPRANKING_SUCCESS, {
                    userCnt: userCnt,
                    userList: result,
                })
            );
        } catch (e) {
            return res
                .status(statusCode.INTERNAL_SERVER_ERROR)
                .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, e.message));
        }
    },
    getProfileInfo: async (req, res) => {
        try {
            const userIdx = req.params.userIdx;
            const groupIdx = req.params.groupIdx;

            const result = await Group.getProfileInfo(userIdx, groupIdx);
            return res
                .status(statusCode.OK)
                .send(util.success(statusCode.OK, responseMessage.CALL_YOUR_INFO, result));
        } catch (e) {
            return res
                .status(statusCode.INTERNAL_SERVER_ERROR)
                .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, e.message));
        }
    },

    addGroup : async (req, res) => {
        // 관리자인지 유효성 검사
        const {
            groupName,
            groupCode,
        } = req.body;
        const groupImage = req.file; // 이미지 파일은 따로 받을 수 밖에 없지
        
        if (groupImage === undefined || groupImage.length === 0) {
            console.log('그룹이미지 입력해주세요.');
            return res
                .status(statusCode.BAD_REQUEST)
                .send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        }

        
        const groupImageUrl = groupImage.location;
        try {
            if (
                !groupName ||
                !groupCode ||
                !groupImageUrl
            ) {
                console.log('필수 입력 값이 없습니다.');
                return res
                    .status(statusCode.BAD_REQUEST)
                    .send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
            }


            const GroupResult = await Group.addGroup({
               groupName,
               groupCode,
               groupImageUrl,
            });
            return await res
                .status(statusCode.OK)
                .send(util.success(statusCode.OK, responseMessage.POST_GROUP));
        } catch (e) {
            console.log('그룹 추가 에러 :', e);
            return await res
                .status(statusCode.INTERNAL_SERVER_ERROR)
                .send(
                    util.fail(
                        statusCode.INTERNAL_SERVER_ERROR,
                        responseMessage.INTERNAL_SERVER_ERROR
                    )
                );
        }

    
}

};
