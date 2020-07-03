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
            // TODO
                // 역, 키워드, 장소정보 별로 필터링 기능 필요!
            const result = await placeDB.getPlacesByGroup(req.params.groupIdx);

            if (req.query.sort === 'asc') result.sort((a, b) => a.placeCreatedAt - b.placeCreatedAt);
            else result.sort((a, b) => b.placeCreatedAt - a.placeCreatedAt);
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SEARCH_PLACE_SUCCESS, result));
        } catch(e) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, responseMessage.DB_ERROR));
        }
    },

    createPlace : async (req, res) =>{
        const userIdx = req.userIdx;
        const {placeName, placeAddress, placeRoadAddress, placeMapX, placeMapY, placeReview, categoryIdx, groupIdx, tags, infoTags, subwayName, subwayLine} = req.body;
        try{
            if(!placeName || !placeAddress || !placeRoadAddress || !placeMapX || !placeMapY || !placeReview || !categoryIdx || !groupIdx || !tags || !infoTags || !subwayName|| !subwayLine){
                console.log('place 필수 입력 갑이 없습니다.');
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST,responseMessage.NULL_VALUE));
            }
            
            /*
            1. merge되면 바로 그룹 ,유저 relation TB 확인해서 유효성 검사 하기
            2. category 유효성 검사
            3. tags 유효성 검사
            4. subway 유효성 검사
            5. placeTable insert
            6. placeImageTB insert
            7. PLACE_TAG_RELATION_TB insert
            */ 

            
        }catch(e){
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR,responseMessage.INTERNAL_SERVER_ERROR));
        }
    }

};

module.exports = placeController;