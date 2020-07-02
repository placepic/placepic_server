const responseMessage = require('../modules/responseMessage');
const statusCode = require('../modules/statusCode');
const util = require('../modules/util');

const placeDB = require('../models/places');

const placeController = {
    getAllPlaces: async (req, res) => {
        try {
            const result = await placeDB.getAllPlaces();
            if (req.query.sort === 'asc') result.sort((a, b) => a.placeCreatedAt - b.placeCreatedAt);
            else result.sort((a, b) => b.placeCreatedAt - a.placeCreatedAt);
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SEARCH_PLACE_SUCCESS, result));
        } catch(e) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, responseMessage.DB_ERROR));
        }
    },

    getPlace: async (req, res) => {
        try {
            const result = await placeDB.getPlace(req.params.placeIdx);
            if (result.length === 0) return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.NO_CONTENT, responseMessage.NO_PLACE));
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SEARCH_PLACE_SUCCESS, result[0]));
        } catch(e) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, responseMessage.DB_ERROR)); 
        }
    },

    getPlacesByGroup: async (req, res) => {
        try {
            const result = await placeDB.getPlacesByGroup(req.params.groupIdx);
            if (req.query.sort === 'asc') result.sort((a, b) => a.placeCreatedAt - b.placeCreatedAt);
            else result.sort((a, b) => b.placeCreatedAt - a.placeCreatedAt);
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SEARCH_PLACE_SUCCESS, result));
        } catch(e) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, responseMessage.DB_ERROR));
        }
    },

};

module.exports = placeController;