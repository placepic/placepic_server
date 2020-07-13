let responseMessage = require('../modules/responseMessage');
let statusCode = require('../modules/statusCode');
let util = require('../modules/util');
let Admin = require('../models/admin');
const crypto = require('crypto');
const jwt = require('../modules/jwt');


exports.getMyWaitUserList = async (req, res) => { // 내 그룹(관리자일때) 승인대기 인원 리스트 불러오기
    const groupIdx = req.params.groupIdx;
    const userIdx = req.userIdx; 

    try {
        const waitUserList = await Admin.getMywaitUserList(groupIdx);

        // if (waitUserList === -1)
        //     console.log("값이 들어오지 않았습니다.");
        //     return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, responseMessage.DB_ERROR));

        //성공
        console.log("승인대기 인원 리스트를 불러오는데 성공하였습니다.");
        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CALL_MYWAITUSERLIST_SUCCESS, 
            waitUserList
        ));
    } catch (err) {
        console.log("승인대기 인원 리스트를 불러오는데 실패했습니다.");
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, err.message));
        throw err;
    }
};

exports.editStatusApplyUser = async (req, res) => {

    const groupIdx = req.params.groupIdx;
    const userIdx = req.body.userIdx;

    try {
        if (!groupIdx || !userIdx) {
            console.log("충분한 값이 들어오지 않았습니다.");
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        }
        const editStatusApplyUser = await Admin.editStatusApplyUser(userIdx, groupIdx);

        if (editStatusApplyUser.length === 0)
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, responseMessage.DB_ERROR));

        console.log("승인수락에 성공했습니다.");
        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.EDIT_MYWAITUSERSTATE_SUCCESS, ));
    } catch (err) {
        console.log("승인수락에 실패했습니다.")
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, err.message));
        throw err;
    }
}; 


exports.deleteStatusApplyUser = async (req, res) => {

    const groupIdx = req.params.groupIdx;
    const userIdx = req.params.userIdx;

    try {
        if (!groupIdx || !userIdx) {
            console.log("충분한 값이 들어오지 않았습니다.");
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        }

        const deleteStatusApplyUser = await Admin.deleteStatusApplyUser(userIdx, groupIdx);

        if (deleteStatusApplyUser.length === 0)
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, responseMessage.DB_ERROR));

        console.log("승인거절에 성공하였습니다.")
        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.DELETE_MYWAITUSER_SUCCESS));
    } catch (err) {
        console.log("승인거절에 실패했습니다.")
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, err.message));
        throw err;
    }
};



exports.getMyInfo = async (req, res) => {
    try {
        const userIdx = req.userIdx;
        const groupIdx = req.params.groupIdx;
        const result = await Admin.getMyInfo(userIdx,groupIdx);
        console.log("승인대기 인원 리스트를 불러오는데 성공하였습니다.");
        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CALL_MYWAITUSERLIST_SUCCESS, result));
    } catch(e) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, e.message));
    }
};