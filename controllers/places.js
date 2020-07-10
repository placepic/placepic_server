const responseMessage = require('../modules/responseMessage');
const statusCode = require('../modules/statusCode');
const util = require('../modules/util');

const placeDB = require('../models/places');
const groupDB = require('../models/group');
const categoryDB = require('../models/category');
const tagsDB = require('../models/tag');
const subwayDB = require('../models/subway');

const _ = require('lodash');

const placeController = {
    getAllPlaces: async (req, res) => {
        try {
            const result = await placeDB.getAllPlaces();
            if (req.query.sort === 'asc') result.sort((a, b) => a.placeCreatedAt - b.placeCreatedAt);
            else result.sort((a, b) => b.placeCreatedAt - a.placeCreatedAt);
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SEARCH_PLACE_SUCCESS, result));
        } catch(e) {
            console.log('get all places error :', e);
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        }
    },

    getPlace: async (req, res) => {
        try {
            const result = await placeDB.getPlace(req.params.placeIdx);
            if (result.length === 0) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_PLACE));
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SEARCH_PLACE_SUCCESS, result[0]));
        } catch(e) {
            console.log('get places error :', e);
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)); 
        }
    },

    getPlacesByGroup: async (req, res) => {
        try {
            const result = await placeDB.getPlacesByGroup(req.params.groupIdx, req.query);

            if (req.query.sort === 'asc') result.sort((a, b) => a.placeCreatedAt - b.placeCreatedAt);
            else result.sort((a, b) => b.placeCreatedAt - a.placeCreatedAt);
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SEARCH_PLACE_SUCCESS, result));
        } catch(e) {
            console.log('getPlacesByGroup error :', e);
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        }
    },
    getPlacesByQuery: async (req, res) => {
        try {
            if (_.isNil(req.query.query)) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.BAD_REQUEST));
            const result  = await placeDB.getPlacesByQuery(req.params.groupIdx, req.query.query);
            result.sort((a, b) => b.placeCreatedAt - a.placeCreatedAt);
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SEARCH_PLACE_SUCCESS, result));
        } catch(e) {
            console.log('get places By Query error :', e);
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        }
    },

    createPlace : async (req, res) =>{
        const userIdx = req.userIdx;
        console.log('user',userIdx)
        const {title, address, roadAddress, mapx, mapy, placeReview, categoryIdx, groupIdx, tags, infoTags, subwayIdx} = req.body;
        const imageFiles = req.files;

        if (imageFiles === undefined || imageFiles.length === 0) {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST,responseMessage.NULL_VALUE));
        }

        const imageUrl = imageFiles.map(img => img.location);
        try{
            if(!title || !address || !roadAddress || !mapx || !mapy || !placeReview || !categoryIdx || !groupIdx || !tags || !infoTags || !subwayIdx ||!imageUrl){
                console.log('필수 입력 값이 없습니다.');
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST,responseMessage.NULL_VALUE));
            }
            
            /* 1. 그룹 ,유저 relation TB 확인해서 유효성 검사 하기*/
            const isValidUserGroup = await groupDB.validUserGroup(userIdx,groupIdx);
            if(isValidUserGroup[0] === undefined){
                console.log('잘못된 접근입니다.')
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST,responseMessage.INVALID_GROUP_USER));
            }

            //2. category 유효성 검사
            const isValidCategory = await categoryDB.getOneCategory(categoryIdx);

            if(isValidCategory.categoryIdx === undefined){
                console.log('카테고리 정보 없음');
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST,responseMessage.NO_READ_CATEGORY));
            }
            
            // 3. tags 유효성 검사
            const isValidTagsOfCategory = tagsDB.getCategoryTags(categoryIdx);
            const isValidDefaultTagsOfCategory = tagsDB.getCategoryDefaultTags(categoryIdx);
            let allTagIdx = [];

            for(it of isValidTagsOfCategory){
                allTagIdx.push(it.tagIdx);
            }

            for(it of isValidDefaultTagsOfCategory){
                allTagIdx.push(it.tagIdx);
            }
            
            for(it of isValidTagsOfCategory){
                if(allTagIdx.indexOf(parseInt(it.tagIdx)) === -1){
                    console.log("기본 정보 태그 에러");
                    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST,responseMessage.NO_MATCHED_CATEGORY_TAG));
                }
            }

            for(it of isValidDefaultTagsOfCategory){
                if(allTagIdx.indexOf(parseInt(it.tagIdx)) === -1){
                    console.log("유용한 정보 태그 에러");
                    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST,responseMessage.NO_MATCHED_CATEGORY_INFO_TAG));
                }
            }
        
            //4. subway 유효성 검사
            const isMatchedSubway = await subwayDB.isMatchedStation(subwayIdx);
            if(isMatchedSubway[0] === undefined){
                console.log("올바르지 않는 지하철 정보입니다.");
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST,responseMessage.NO_READ_SUBWAY));
            }
            const placesResult = await placeDB.addPlace({title, address, roadAddress, mapx, mapy, placeReview, categoryIdx, groupIdx, tags, infoTags, subwayIdx, userIdx, imageUrl});
            console.log(placesResult); // undefined 
            return await res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.POST_PLACE));
        }catch(e){
            console.log('장소 추가 에러 :', e);
            return await res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR,responseMessage.INTERNAL_SERVER_ERROR));
        }
    }

};

module.exports = placeController;