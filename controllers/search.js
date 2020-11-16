const responseMessage = require('../modules/responseMessage');
const statusCode = require('../modules/statusCode');
const util = require('../modules/util');

const api = require('../modules/api');

const placeDB = require('../models/places');

const searchController = {
    searchPlaceWithNaverAPI: async (req, res) => {
        try {
            if (req.query.query.trim() === '') return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
            let result = await api.mapFindAPI(req.query.query);

            const placeIdxInDB = (await placeDB.getPlacesByGroup(req.params.groupIdx, {})).map(place => '' + place.placeMapX + place.placeMapY);
            result = result.map(r => {
                return {
                    placeName: r.title.replace(/<b>|<\/b>/g, ''),
                    placeAddress: r.address,
                    placeRoadAddress: r.roadAddress,
                    placeMapX: r.mapx,
                    placeMapY: r.mapy,
                    link: r.link,
                    // TODO 여기 노가다해야됨
                    mobileNaverMapLink: `https://m.map.naver.com/search2/search.nhn?query=${encodeURI(r.title.replace(/<b>|<\/b>/g, ''))}&sm=hty&style=v5#/map/1`,
                    alreadyIn: placeIdxInDB.indexOf(r.placeId) !== -1,
                };
            });
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SEARCH_NAVER_MAP, {result, count: result.length}));
        } catch(e) {
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        }
    },
};

module.exports = searchController;