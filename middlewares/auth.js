
const jwt = require('../modules/jwt');
const MSG = require('../modules/responseMessage');
const CODE = require('../modules/statusCode');
const util = require('../modules/util');
const TOKEN_EXPIRED = -3;
const TOKEN_INVALID = -2;

const authUtil = {
    checkToken: async (req, res, next) => {
        var token = req.headers.token;
        // 토큰 없음
        if (!token){
            console.log('token없음')
            return res.status(CODE.BAD_REQUEST).json(util.fail(CODE.BAD_REQUEST, MSG.EMPTY_TOKEN));
        }
        // decode
        const user = await jwt.verify(token);
        // 유효기간 만료
        if (user === TOKEN_EXPIRED)
            return res.status(CODE.UNAUTHORIZED).json(util.fail(CODE.UNAUTHORIZED, MSG.EXPIRED_TOKEN));
        // 유효하지 않는 토큰
        if (user === TOKEN_INVALID)
            return res.status(CODE.UNAUTHORIZED).json(util.fail(CODE.UNAUTHORIZED, MSG.INVALID_TOKEN));
        if (user.idx === undefined)
            return res.status(CODE.UNAUTHORIZED).json(util.fail(CODE.UNAUTHORIZED, MSG.INVALID_TOKEN));
        req.userIdx = user.idx;
        next();
    },
    // 앱 관리자 api 사용
    checkAdmin: async (req, res, next) => {
        const token = req.headers.token;
        // 토큰 없음
        if (!token){
            console.log('관리자 token없음');
            return res.status(CODE.BAD_REQUEST).json(util.fail(CODE.BAD_REQUEST, MSG.EMPTY_TOKEN));
        }
        const key = require('../config/placepic').phoneNumber;
        if (token !== key) return res.status(CODE.UNAUTHORIZED).json(util.fail(CODE.UNAUTHORIZED, MSG.INVALID_TOKEN));
        
        next();
    }
}

module.exports = authUtil;