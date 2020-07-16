let responseMessage = require('../modules/responseMessage');
let statusCode = require('../modules/statusCode');
let util = require('../modules/util');
let Admin = require('../models/admin');
let Group = require('../models/group');

module.exports = {
    getMyWaitUserList: async (req, res) => { // 내 그룹(관리자일때) 승인대기 인원 리스트 불러오기
        const groupIdx = req.params.groupIdx;
        const userIdx = req.userIdx;
        try {
            const waitUserList = await Admin.getMywaitUserList(groupIdx);
            if (!groupIdx || !userIdx) {
                console.log("충분한 값이 들어오지 않았습니다.");
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
            }

            if (await Group.checkGroupIdx(groupIdx) === 0) {
                console.log("해당 그룹이 존재하지 않습니다.");
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.CALL_GROUP_FAIL));

            }

            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CALL_MYWAITUSERLIST_SUCCESS,
                waitUserList
            ));
        } catch (err) {
            console.log("승인대기 인원 리스트를 불러오는데 실패했습니다.");
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, err.message));
        }
    },
    getMyInfo: async (req, res) => {
        try {
            const userIdx = req.userIdx;
            const groupIdx = req.params.groupIdx;
            const result = await Admin.getMyInfo(userIdx, groupIdx);
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CALL_MYWAITUSERLIST_SUCCESS, result));
        } catch (e) {
            console.log("내 정보를 불러오지 못했습니다.")
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, e.message));
        }
    },
    editStatusApplyUser: async (req, res) => {

        const groupIdx = req.params.groupIdx;
        const userIdx = req.body.userIdx;
        try {
            if (!groupIdx || !userIdx) {
                console.log("충분한 값이 들어오지 않았습니다.");
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
            }
            const editStatusApplyUser = await Admin.editStatusApplyUser(userIdx, groupIdx);
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.EDIT_MYWAITUSERSTATE_SUCCESS, ));
        } catch (err) {
            console.log("승인수락에 실패했습니다.")
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, err.message));
        }
    },
    deleteStatusApplyUser: async (req, res) => {
        const groupIdx = req.params.groupIdx;
        const userIdx = req.params.userIdx;
        try {
            if (!groupIdx || !userIdx) {
                console.log("충분한 값이 들어오지 않았습니다.");
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
            }
            const deleteStatusApplyUser = await Admin.deleteStatusApplyUser(userIdx, groupIdx);
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.DELETE_MYWAITUSER_SUCCESS));
        } catch (err) {
            console.log("승인거절에 실패했습니다.")
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, err.message));
        }
    }
}