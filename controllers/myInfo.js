let responseMessage = require('../modules/responseMessage');
let statusCode = require('../modules/statusCode');
let util = require('../modules/util');
let myInfo = require('../models/myInfo');
const crypto = require('crypto');
const jwt = require('../modules/jwt');



exports.getMyInfo = async (req, res) => {
    try {
        const userIdx = req.userIdx;
        const groupIdx = req.params.groupIdx;
        const result = await myInfo.getMyInfo(userIdx,groupIdx);
        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CALL_MYWAITUSERLIST_SUCCESS, result[0]));
    } catch(e) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, e.message));
    }
};