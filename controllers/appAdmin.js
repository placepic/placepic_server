const util = require('../modules/util');
const responseMessage = require('../modules/responseMessage');
const statusCode = require('../modules/statusCode');
const bannerDB = require('../models/banner');

module.exports = {
    getBannerList: async (req, res) => {
        try {
            const bannerList = await bannerDB.getAllBanners();
            return res
                .status(statusCode.OK)
                .send(util.success(statusCode.OK, responseMessage.GET_BANNER_SUCCESS, bannerList));
        } catch (err) {
            console.log('배너 리스트 조회 실패.');
            return res
                .status(statusCode.INTERNAL_SERVER_ERROR)
                .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.GET_BANNER_FAIL));
        }
    },
    getBanner: async (req, res) => {
        const bannerIdx = req.params.bannerIdx;
        if (!bannerIdx) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        try {
            const banner = await bannerDB.getBanner(bannerIdx);
            if (!banner) return res.status(statusCode.OK).send(util.fail(statusCode.NO_CONTENT, responseMessage.NO_BANNER));
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_BANNER_SUCCESS, banner));
        } catch (err) {
            console.log('배너 조회 실패');
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.GET_BANNER_FAIL));
        }
    },
    getBannerListByGroup: async (req, res) => {
        const groupIdx = req.params.groupIdx;
        if (!groupIdx) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        try {
            const bannerList = await bannerDB.getBannerListByGroup(groupIdx);
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_BANNER_SUCCESS, bannerList));
        } catch (err) {
            console.log('배너 조회 실패');
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.GET_BANNER_FAIL));
        }
    },
};