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
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SEARCH_PLACE_SUCCESS, {result, count: result.length}));
        } catch(e) {
            console.log('get all places error :', e);
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        }
    },
    getPlace: async (req, res) => {
        const placeIdx = req.params.placeIdx;
        const userIdx = req.userIdx;
        try {
            const result = await placeDB.getPlace(placeIdx,userIdx);
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
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SEARCH_PLACE_SUCCESS, {result, count: result.length}));
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
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SEARCH_PLACE_SUCCESS, {result, count: result.length}));
        } catch(e) {
            console.log('get places By Query error :', e);
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        }
    },
    createPlace : async (req, res) =>{
        const userIdx = req.userIdx;
        let {title, address, roadAddress, mapx, mapy, placeReview, categoryIdx, groupIdx, tags, infoTags, subwayIdx} = req.body;
        const imageFiles = req.files;
        console.log(req.body);
        // 코드정리
        subwayIdx = typeof(subwayIdx) === "object" ? subwayIdx : JSON.parse(subwayIdx);
        tags = typeof(tags) === "object" ? tags : JSON.parse(tags);
        infoTags = typeof(infoTags) === "object" ? infoTags : JSON.parse(infoTags);
        
        if (imageFiles === undefined || imageFiles.length === 0) {
            console.log('이미지 입력해주세요.');
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST,responseMessage.NULL_VALUE));
        }
        
        const imageUrl = imageFiles.map(img => img.location);
        try{
            if(!title || !address || !roadAddress || !mapx || !mapy || !placeReview || !categoryIdx || !groupIdx || !tags || !infoTags ||!imageUrl){
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
            for(let it in subwayIdx){
                console.log(subwayIdx[it]);
                let isMatchedSubway = subwayIdx[it] ? await subwayDB.isMatchedStation(subwayIdx[it]) : null; 
                console.log(isMatchedSubway);
                if(isMatchedSubway === undefined){
                    console.log("올바르지 않는 지하철 정보입니다.");
                    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST,responseMessage.NO_READ_SUBWAY));
                }   
            }
            
            const placesResult = await placeDB.addPlace({title, address, roadAddress, mapx, mapy, placeReview, categoryIdx, groupIdx, tags, infoTags, subwayIdx, userIdx, imageUrl});
            return await res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.POST_PLACE));
        }catch(e){
            console.log('장소 추가 에러 :', e);
            return await res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR,responseMessage.INTERNAL_SERVER_ERROR));
        }
    },
    addLike : async (req, res)=>{
        const userIdx = req.userIdx;
        const {placeIdx} = req.body;
        
        //placeIdx, 유효성 검사 userIdx, placeIdx 받아서 검색
        try{
            const isPlace = await placeDB.isCheckPlace(placeIdx);
            if(isPlace.length === 0){
                console.log('유효하지 않는 placeIdx 입니다.');
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_PLACE));
            }

            const isLiked = await placeDB.getLikeIdx({userIdx,placeIdx}); 
            if(isLiked.length !== 0){
                console.log('이미 좋아요가 되어있습니다.');
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ALREADY_LIKE));
            }
            const result = await placeDB.addLike({userIdx,placeIdx});
            return res.status(statusCode.OK).send(util.success(statusCode.OK,responseMessage.ADD_LIKE));
        }catch(err){
            console.log('좋아요 에러.',err);
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR,responseMessage.INTERNAL_SERVER_ERROR));
        }
    },
    deleteLike : async (req,res) =>{
        const userIdx = req.userIdx;
        const placeIdx = req.params.placeIdx;

        try{
            const isPlace = await placeDB.isCheckPlace(placeIdx);
            if(isPlace.length === 0){
                console.log('유효하지 않는 placeIdx 입니다.');
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_PLACE));
            }

            const isLiked = await placeDB.getLikeIdx({userIdx,placeIdx}); 
            if(isLiked.length === 0){
                console.log('좋아요가 없습니다.');
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_LIKE));
            }
            const result = await placeDB.deleteLike({userIdx,placeIdx});
            return res.status(statusCode.OK).send(util.success(statusCode.OK,responseMessage.DELETE_LIKE));
        }catch(err){
            console.log('deleteLike err ',err);
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR,responseMessage.INTERNAL_SERVER_ERROR));
        }
    },
    getLikeList : async (req, res) =>{
        const userIdx = req.userIdx;
        const placeIdx = req.params.placeIdx;
        try{
            const isPlace = await placeDB.isCheckPlace(placeIdx);
            if(isPlace.length === 0){
                console.log('유효하지 않는 placeIdx 입니다.');
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_PLACE));
            }

            const result = await placeDB.getLikeList(placeIdx);
            return res.status(statusCode.OK).send(util.success(statusCode.OK,responseMessage.GET_LIKE_LIST, result));

        }catch(err){
            console.log('getLike err',err);
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR,responseMessage.INTERNAL_SERVER_ERROR));
        }
    },
    addBookmark : async (req, res)=>{
        const userIdx = req.userIdx;
        const {placeIdx} = req.body;
        
        //placeIdx, 유효성 검사 userIdx, placeIdx 받아서 검색
        try{
            const isPlace = await placeDB.isCheckPlace(placeIdx);
            if(isPlace.length === 0){
                console.log('유효하지 않는 placeIdx 입니다.');
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_PLACE));
            }

            const isLiked = await placeDB.getBookmarkIdx({userIdx,placeIdx}); 
            if(isLiked.length !== 0){
                console.log('이미 북마크가 되어있습니다.');
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ALREADY_BOOKMARK));
            }
            const result = await placeDB.addBookmark({userIdx,placeIdx});
            return res.status(statusCode.OK).send(util.success(statusCode.OK,responseMessage.ADD_BOOKMARK));
        }catch(err){
            console.log('좋아요 에러.',err);
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR,responseMessage.INTERNAL_SERVER_ERROR));
        }
    },
    deleteBookmark : async (req,res) =>{
        const userIdx = req.userIdx;
        const placeIdx = req.params.placeIdx;

        try{
            const isPlace = await placeDB.isCheckPlace(placeIdx);
            if(isPlace.length === 0){
                console.log('유효하지 않는 placeIdx 입니다.');
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_PLACE));
            }

            const isLiked = await placeDB.getBookmarkIdx({userIdx,placeIdx}); 
            if(isLiked.length === 0){
                console.log('좋아요가 없습니다.');
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_BOOKMARK));
            }
            const result = await placeDB.deleteBookmark({userIdx,placeIdx});
            return res.status(statusCode.OK).send(util.success(statusCode.OK,responseMessage.DELETE_BOOKMARK));
        }catch(err){
            console.log('deleteLike err ',err);
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR,responseMessage.INTERNAL_SERVER_ERROR));
        }
    },
    getOnePlace : async (req,res)=>{
        const userIdx = req.userIdx;
        const placeIdx = req.params.placeIdx;
        try{
            const result = await placeDB.getOnePlace({userIdx, placeIdx});
            return res.status(statusCode.OK).send(util.success(statusCode.OK,responseMessage.READ_PLACES, result));
        }catch(err){
            console.log('place 생성 에러 ',err);
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR,responseMessage.INTERNAL_SERVER_ERROR));
        }
    },
    deletePlace : async (req,res) =>{
        const userIdx = req.userIdx;
        const placeIdx = req.params.placeIdx;
        try{
            const placeIdCheck = await placeDB.isMyPlacePost(userIdx,placeIdx);
            if(_.isNil(placeIdCheck)){
                console.log('삭제 권한이 없는 아이디.');
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST,responseMessage.NOT_DELETE_PLACE));
            }
            const result = await placeDB.deletePlace(placeIdx);
            return res.status(statusCode.OK).send(util.success(statusCode.OK,responseMessage.DELETE_PLACE));
        }catch(err){
            console.log('place 삭제 에러', err);
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR,responseMessage.INTERNAL_SERVER_ERROR));
        }
    }

};

module.exports = placeController;