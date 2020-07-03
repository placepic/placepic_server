const responseMessage = require('../modules/responseMessage');
const statusCode = require('../modules/statusCode');
const util = require('../modules/util');

const api = require('../modules/api');

const placeDB = require('../models/places');

const searchController = {
    searchPlaceWithNaverAPI: async (req, res) => {
        try {
            let result = await api.mapFindAPI(req, res);
            const placeIdxInDB = (await placeDB.getPlacesByGroup(req.params.groupIdx)).map(place => place.placeIdx);

            result = result.map(r => {
                r.title = r.title.replace(/<b>|<\/b>/g, '');
                r.mobileNaverMapLink = `https://m.map.naver.com/search2/search.nhn?query=${encodeURI(r.title)}&sm=hty&style=v5#/map/1`;
                placeIdxInDB.indexOf(r.placeId * 1) !== -1 ? r.alreadyIn = true : r.alreadyIn = false;
                return r;
            });
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SEARCH_NAVER_MAP, result));
        } catch(e) {
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        }
    },
};

module.exports = searchController;