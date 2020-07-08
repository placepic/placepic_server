let responseMessage = require('../modules/responseMessage');
let statusCode = require('../modules/statusCode');
let util = require('../modules/util');
let Group = require('../models/group');
const crypto = require('crypto');
const jwt = require('../modules/jwt');

exports.apply = async (req, res) => {
    const groupIdx = req.params.groupIdx;
    const userIdx = req.userIdx;
    //const status = 2; // 디폴트가 2가 아니면 2를 넣어준다.
    const {
        part,
        phoneNumber
    } = req.body;
    try {
        //null 값 확인
        if (!groupIdx || !userIdx || !part || !phoneNumber){
            console.log("필요한 값이 없습니다.");
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        }
        //1. 해당그룹이존재하는지
        if(await Group.checkGroupIdx(groupIdx) === null){
            console.log("해당그룹이 존재하지 않습니다.");
        }
        
        //2. 이미 신청한 그룹인지
        //3.  
        const groupApply = await Group.apply(groupIdx, userIdx, part, phoneNumber);
        console.log(groupApply);
        if (groupApply===-1){
            console.log("")
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, responseMessage.DB_ERROR));
        }
        
        //성공
        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.apply_SUCCESS, {
            userIdx: userIdx,
            groupIdx: groupIdx,
            userPart: part
        }));
    } catch (err) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, err.message));
        throw err;
    }
};





exports.getMyGroupList = async (req, res) => {

    const userIdx = req.userIdx;
    const QueryObject = req.query;
    try {


        const groupInfo = await Group.callMygroupInfo(userIdx); //그룹에 대한 이름, 이미지
        const groupUserCnt = await Group.callMygroupUserCnt(userIdx); // 그룹에 대한 유저 수
        const groupPostCnt = await Group.callMygroupPostCnt(userIdx); // 그룹에 대한 게시물 수
        const myGroupList = await Group.getMyGroupList(userIdx, QueryObject);


        for (let i = 0; i < myGroupList.length; i++) {

            const myGroupUserCnt = await Group.getGroupUserCnt(myGroupList[i].groupIdx);
            const myGroupPostCnt = await Group.getGroupPostCnt(myGroupList[i].groupIdx);
            myGroupList[i].UserCount = myGroupUserCnt;
            myGroupList[i].PostCount = myGroupPostCnt;

        }


        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CALL_GROUP_LIST, {
            myGroupList: myGroupList.filter(group => group.groupIdx !== null)
        }));
    } catch (err) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, err.message));
        throw err;
    }

};



exports.getMyWaitUserList = async (req, res) => {
    const groupIdx = req.params.groupIdx;
    const userIdx = req.userIdx;

    try {
        const waitUserList = await Group.getMywaitUserList(groupIdx);

        if (waitUserList === -1)
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, responseMessage.DB_ERROR));

        //성공
        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CALL_MYWAITUSERLIST_SUCCESS, waitUserList));
    } catch (err) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, err.message));
        throw err;
    }
};

exports.editStatusApplyUser = async (req, res) => {

    const groupIdx = req.params.groupIdx;
    const userIdx = req.body.userIdx;

    try {
        if (!groupIdx || !userIdx) {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        }
        const editStatusApplyUser = await Group.editStatusApplyUser(userIdx, groupIdx);

        if (editStatusApplyUser.length === 0)
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, responseMessage.DB_ERROR));

        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.EDIT_MYWAITUSERSTATE_SUCCESS, ));
    } catch (err) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, err.message));
        throw err;
    }
};


exports.deleteStatusApplyUser = async (req, res) => {

    const groupIdx = req.params.groupIdx;
    const userIdx = req.body.userIdx;

    try {
        if (!groupIdx || !userIdx) {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        }

        const deleteStatusApplyUser = await Group.deleteStatusApplyUser(userIdx, groupIdx);

        if (deleteStatusApplyUser.length === 0)
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, responseMessage.DB_ERROR));

        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.DELETE_MYWAITUSER_SUCCESS));
    } catch (err) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, err.message));
        throw err;
    }
};