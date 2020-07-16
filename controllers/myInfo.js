let responseMessage = require('../modules/responseMessage');
let statusCode = require('../modules/statusCode');
let util = require('../modules/util');
let myInfo = require('../models/myInfo');

exports.getMyInfo = async (req, res) => {
    try {
        const userIdx = req.userIdx;
        const groupIdx = req.params.groupIdx;
        const result = await myInfo.getMyInfo(userIdx, groupIdx);

        if (result.length === 0) {
            console.log("그룹에 유저가 속해 있지 않습니다.");
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NOT_IN_GROUP_USER));
        }

        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CALL_MYWAITUSERLIST_SUCCESS, result[0]));
    } catch (e) {
        console.log('getMyInfo error', e);
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, e.message));
    }
};