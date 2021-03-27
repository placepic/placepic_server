let responseMessage = require('../modules/responseMessage');
let statusCode = require('../modules/statusCode');
let util = require('../modules/util');
let myInfo = require('../models/myInfo');

const MyInfo = {
    getMyInfo :  async (req, res) => {
        try {
            const userIdx = req.userIdx;
            const groupIdx = req.params.groupIdx;
            const result = await myInfo.getMyInfo(userIdx, groupIdx);
    
            if (result.length === 0) {
                console.log("그룹에 유저가 속해 있지 않습니다.");
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NOT_IN_GROUP_USER));
            }
    
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_PROFILE_SUCCESS, result[0]));
        } catch (e) {
            console.log('getMyInfo error', e);
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, e.message));
        }
    },

    editMyInfo : async(req,res) => {
        const userIdx = req.userIdx;
        const profileImageUrl = req.file? req.file.location : undefined;
        const groupIdx = req.params.groupIdx;
        const part = req.body.part;
        console.log("파트 : ",part)
        console.log(profileImageUrl);

        try {
            const editProfileResult = await myInfo.editMyInfo(userIdx,groupIdx,profileImageUrl,part);
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.EDIT_MYINFO));
        }catch(e) {
            console.log('getMyInfo error', e);
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, e.message));
        }
    },

    getPlacesWithUser : async (req,res) => {
        const userIdx = req.userIdx;
        const groupIdx = req.params.groupIdx;
        try {
            const result = await myInfo.getPlacesWithUser(userIdx,groupIdx);
            result.UserPlace.sort((a, b) => b.placeIdx - a.placeIdx);
            return res.status(statusCode.OK).send(util.success(statusCode.OK,responseMessage.READ_PLACES, result));
        }catch(err){
            console.log('getLike err',err);
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR,responseMessage.INTERNAL_SERVER_ERROR));
        }

    },



}

module.exports = MyInfo;