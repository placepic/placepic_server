const util = require('../modules/util');
const responseMessage = require('../modules/responseMessage');
const statusCode = require('../modules/statusCode');
const bannerDB = require('../models/banner');
const placeDB = require('../models/places');

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
    // getBannerListByGroup: async (req, res) => {
    //     const groupIdx = req.params.groupIdx;
    //     if (!groupIdx) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    //     try {
    //         const bannerList = await bannerDB.getBannerListByGroup(groupIdx);
    //         return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_BANNER_SUCCESS, bannerList));
    //     } catch (err) {
    //         console.log('배너 조회 실패');
    //         return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.GET_BANNER_FAIL));
    //     }
    // },
    getBannerPlaces: async (req, res) => {
        // 영훈 코드 수정 (placeDB의 getBannerPlace에서 인증 부분만 제거함)
        const { bannerIdx } = req.params;
        if (!bannerIdx)
            return res
                .status(statusCode.BAD_REQUEST)
                .send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        try {
            const existPlace = await placeDB.isGetBannerPlace(bannerIdx);
            if (!existPlace) {
                return res
                    .status(statusCode.OK)
                    .send(util.success(statusCode.OK, responseMessage.GET_BANNER_SUCCESS, []));
            }
            const bannerList = await placeDB.getBannerPlaces(bannerIdx);
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
    addBanner: async (req, res) => {
        const {
            bannerTitle,
            bannerBadgeName,
            bannerBadgeColor,
            bannerDescription,
            bannerImageUrl,
            groupIdx,
        } = req.body;
        if (!bannerBadgeName || !bannerBadgeColor || !groupIdx)
            return res
                .status(statusCode.BAD_REQUEST)
                .send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        try {
            const result = await bannerDB.addBanner(
                bannerTitle,
                bannerBadgeName,
                bannerBadgeColor,
                bannerDescription,
                bannerImageUrl,
                groupIdx
            );
            return res
                .status(statusCode.OK)
                .send(util.success(statusCode.OK, responseMessage.POST_BANNER_SUCCESS));
        } catch (err) {
            console.log('배너 등록 실패');
            return res
                .status(statusCode.INTERNAL_SERVER_ERROR)
                .send(
                    util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.POST_BANNER_FAIL)
                );
        }
    },
    deleteBanner: async (req, res) => {
        const { bannerIdx } = req.params;
        if (!bannerIdx)
            return res
                .status(statusCode.BAD_REQUEST)
                .send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        try {
            const result = await bannerDB.deleteBanner(bannerIdx);
            return res
                .status(statusCode.OK)
                .send(util.success(statusCode.OK, responseMessage.DELETE_BANNER_SUCCESS));
        } catch (err) {
            console.log('배너 삭제 실패');
            return res
                .status(statusCode.INTERNAL_SERVER_ERROR)
                .send(
                    util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.DELETE_BANNER_FAIL)
                );
        }
    },
    addPlaceToBanner: async (req, res) => {
        const { bannerIdx, placeIdx } = req.params;
        if (!bannerIdx || !placeIdx)
            return res
                .status(statusCode.BAD_REQUEST)
                .send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        try {
            // TODO 예외처리
            // 1 장소 있는지 확인
            // 2 장소와 배너가 같은 그룹에 있는지 확인
            if (await bannerDB.checkBannerHasPlace(bannerIdx, placeIdx))
                return res
                    .status(statusCode.BAD_REQUEST)
                    .send(
                        util.fail(statusCode.BAD_REQUEST, responseMessage.ALREADY_POST_BANNER_PLACE)
                    );
            const result = await bannerDB.addBannerPlace(bannerIdx, placeIdx);
            return res
                .status(statusCode.OK)
                .send(util.success(statusCode.OK, responseMessage.POST_BANNER_PLACE_SUCCESS));
        } catch (err) {
            console.log('배너 장소 추가 실패');
            return res
                .status(statusCode.INTERNAL_SERVER_ERROR)
                .send(
                    util.fail(
                        statusCode.INTERNAL_SERVER_ERROR,
                        responseMessage.POST_BANNER_PLACE_FAIL
                    )
                );
        }
    },
    addPlacesToBanner: async (req, res) => {
        const { bannerIdx } = req.params;
        const { placeIdxList } = req.body;
        if (!bannerIdx || !placeIdxList)
            return res
                .status(statusCode.BAD_REQUEST)
                .send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        try {
            // TODO 예외처리
            // 1 장소 있는지 확인
            // 2 장소와 배너가 같은 그룹에 있는지 확인
            // if (await bannerDB.checkBannerHasPlace(bannerIdx, placeIdx)) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ALREADY_POST_BANNER_PLACE));
            const promises = [];
            placeIdxList.forEach((placeIdx) =>
                promises.push(bannerDB.addBannerPlace(bannerIdx, placeIdx))
            );
            await Promise.all(promises);
            return res
                .status(statusCode.OK)
                .send(util.success(statusCode.OK, responseMessage.POST_BANNER_PLACE_SUCCESS));
        } catch (err) {
            console.log('배너 장소 추가 실패');
            console.log(err);
            return res
                .status(statusCode.INTERNAL_SERVER_ERROR)
                .send(
                    util.fail(
                        statusCode.INTERNAL_SERVER_ERROR,
                        responseMessage.POST_BANNER_PLACE_FAIL
                    )
                );
        }
    },
    deletePlaceToBanner: async (req, res) => {
        const { bannerIdx, placeIdx } = req.params;
        if (!bannerIdx || !placeIdx)
            return res
                .status(statusCode.BAD_REQUEST)
                .send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

        try {
            const result = await bannerDB.deleteBannerPlace(bannerIdx, placeIdx);
            return res
                .status(statusCode.OK)
                .send(util.success(statusCode.OK, responseMessage.DELETE_BANNER_PLACE_SUCCESS));
        } catch (err) {
            console.log('배너 장소 삭제 실패');
            return res
                .status(statusCode.INTERNAL_SERVER_ERROR)
                .send(
                    util.fail(
                        statusCode.INTERNAL_SERVER_ERROR,
                        responseMessage.DELETE_BANNER_PLACE_FAIL
                    )
                );
        }
    },
    deletePlacesToBanner: async (req, res) => {
        const { bannerIdx } = req.params;
        const { placeIdxList } = req.body;
        const promises = [];
        if (!bannerIdx || !placeIdxList)
            return res
                .status(statusCode.BAD_REQUEST)
                .send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        try {
            placeIdxList.forEach((placeIdx) => {
                promises.push(bannerDB.deleteBannerPlace(bannerIdx, placeIdx));
            });
            await Promise.all(promises);
            return res
                .status(statusCode.OK)
                .send(util.success(statusCode.OK, responseMessage.DELETE_BANNER_PLACE_SUCCESS));
        } catch (err) {
            console.log('배너 장소 삭제 실패');
            return res
                .status(statusCode.INTERNAL_SERVER_ERROR)
                .send(
                    util.fail(
                        statusCode.INTERNAL_SERVER_ERROR,
                        responseMessage.DELETE_BANNER_PLACE_FAIL
                    )
                );
        }
    },
};
