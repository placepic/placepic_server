const responseMessage = require('../modules/responseMessage');
const statusCode = require('../modules/statusCode');
const util = require('../modules/util');

const placeDB = require('../models/places');
const groupDB = require('../models/placeGroup');
const categoryDB = require('../models/category');
const tagsDB = require('../models/tag');
const subwayDB = require('../models/subway');

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
            if (result.length === 0) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_PLACE));
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

    createPlace : async (req, res) =>{
        const userIdx = req.userIdx;
        console.log('user',userIdx)
        const {placeIdx, title, address, roadAddress, mapx, mapy, placeReview, categoryIdx, groupIdx, tags, infoTags, subwayName, subwayLine} = req.body;
        const imageFiles = req.files;

        if (imageFiles === undefined || imageFiles.length === 0) {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST,responseMessage.NULL_VALUE));
        }

        const imageUrl = imageFiles.map(img => img.location);
        try{
            if(!placeIdx || !title || !address || !roadAddress || !mapx || !mapy || !placeReview || !categoryIdx || !groupIdx || !tags || !infoTags || !subwayName|| !subwayLine ||!imageUrl){
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
            if(isValidCategory[0] === undefined){
                console.log('카테고리 정보 없음');
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST,responseMessage.NO_READ_CATEGORY));
            }
            
            // 3. tags 유효성 검사
            const isValidTagsOfCategory = await tagsDB.getCategoryTags(categoryIdx);
            let allTagIdx = [];
            isValidTagsOfCategory.forEach((it) => {
                allTagIdx.push(it.tagIdx);
            });

            tags.forEach((it)=>{
                if(allTagIdx.indexOf(parseInt(it)) === -1){
                    console.log("기본 정보 태그 에러");
                    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST,responseMessage.NO_MATCHED_CATEGORY_TAG));
                }
            });

            infoTags.forEach((it)=>{
                if(allTagIdx.indexOf(parseInt(it)) === -1){
                    console.log("유용한 정보 태그 에러");
                    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST,responseMessage.NO_MATCHED_CATEGORY_INFO_TAG));
                }
            });

            //4. subway 유효성 검사
            const isMatchedSubway = await subwayDB.isMatchedStation({subwayName,subwayLine});
            if(isMatchedSubway[0] === undefined){
                console.log("올바르지 않는 지하철 정보입니다. 호선과 지하철 이름을 다시 확인 해 주세요.");
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST))
            }
            await placeDB.addPlace({placeIdx, title, address, roadAddress, mapx, mapy, placeReview, categoryIdx, groupIdx, tags, infoTags, subwayName, subwayLine, userIdx, imageUrl});
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.POST_PLACE));
        }catch(e){
            console.log('장소 추가 에러 :', e);
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR,responseMessage.INTERNAL_SERVER_ERROR));
        }
    }

};

module.exports = placeController;