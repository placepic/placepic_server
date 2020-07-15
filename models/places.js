const _ = require('lodash');
const pool = require('../modules/pool');
const moment = require('moment');
const table = 'PLACE_TB';
const placeImageTB = 'PLACEIMAGE_TB';
const placeTagTB = 'PLACE_TAG_RELATION_TB';
const userTB = 'USER_TB';
const subwayPlaceTB = 'SUBWAY_PLACE_RELATION_TB';
const likeTB = 'LIKE_TB';
const bookmarkTB = 'BOOKMARK_TB';
const subwayTB = 'SUBWAY_TB';
const tableModule = require('../modules/table');

const place = {
    getAllPlaces: async () => {
        try {
            return await pool.queryParam(`SELECT * FROM ${table}`);
        } catch (e) {
            throw e;
        }
    },
    getPlace: async (placeIdx,userIdx) => {
        try {
            const tagTable = tableModule.getTagName();
            const categoryTable = tableModule.getCategory();
            const subwayTable = tableModule.getSubwayGroup();
            
            let placeTable = `SELECT * FROM ${table} WHERE placeIdx=${placeIdx}`;
            
            const placeTagQuery = `SELECT * FROM 
                (SELECT * FROM (${placeTable}) as PLACE natural left outer join PLACE_TAG_RELATION_TB) as PLACETAG 
                natural left outer join USER_TB`;
            const placeSubwayQuery = `SELECT * FROM
                (SELECT * FROM (${placeTable}) as PLACE natural left outer join SUBWAY_PLACE_RELATION_TB)
                as PLACESUBWAY natural left outer join USER_TB`;
            const placeLikeQuery = `SELECT COUNT(*) as likeCnt FROM ${likeTB} WHERE placeIdx = ${placeIdx}`;
            const isLikedQuery = `SELECT COUNT(*) as isLiked FROM ${likeTB} WHERE userIdx = ${userIdx} and placeIdx = ${placeIdx}`;
            const isBookmarkedQuery = `SELECT COUNT(*) as isBookmarked FROM ${bookmarkTB} WHERE userIdx = ${userIdx} and placeIdx = ${placeIdx}`;

            const queryResult = new Map();
            const placeTagResult = await pool.queryParam(placeTagQuery);
            const placeSubwayResult = await pool.queryParam(placeSubwayQuery);
            const likeCntResult = await pool.queryParam(placeLikeQuery); //좋아요
            const isLikedResult = await pool.queryParam(isLikedQuery);
            const isBookmarkedResult = await pool.queryParam(isBookmarkedQuery);
            console.log('likeCnt :',likeCntResult);
            console.log('liked :',isLikedResult)
            console.log('bookmark  :',isBookmarkedResult);
            let result = placeTagResult
            .concat(placeSubwayResult)

                result
                .forEach(ele => {
                    if(queryResult.has(ele.placeIdx)) {
                        if (!_.isNil(ele.tagIdx)) queryResult.get(ele.placeIdx).tag.push(tagTable.find(tag => tag.tagIdx === ele.tagIdx));
                        if (!_.isNil(ele.subwayIdx)) queryResult.get(ele.placeIdx).subway.push(subwayTable.find(subway => subway.subwayIdx === ele.subwayIdx));
                    } else {
                        queryResult.set(ele.placeIdx, {
                            placeIdx: ele.placeIdx,
                            placeName: ele.placeName,
                            placeAddress: ele.placeAddress,
                            placeRoadAddress: ele.placeRoadAddress,
                            placeMapX: ele.placeMapX,
                            placeMapY: ele.placeMapY,
                            placeCreatedAt: ele.placeCreatedAt,
                            placeReview: ele.placeReview,
                            category: categoryTable.find(category => category.categoryIdx === ele.categoryIdx),
                            groupIdx: ele.groupIdx,
                            placeViews: ele.placeViews,
                            likeCnt : '',
                            liked : false,
                            bookmark :false,
                            tag: _.isNil(ele.tagIdx) ? [] : [tagTable.find(tag => tag.tagIdx === ele.tagIdx)],
                            subway: _.isNil(ele.subwayIdx) ? [] : [subwayTable.find(subway => subway.subwayIdx === ele.subwayIdx)],
                            user: {
                                userIdx: ele.userIdx,
                                userName: _.isNil(ele.userName) ? '' : ele.userName,
                                email: _.isNil(ele.email) ? '' : ele.email,
                                profileURL: _.isNil(ele.userProfileImageUrl) ? '' : ele.userProfileImageUrl,
                            },
                            imageUrl: [],
                            likes :[]
                        });
                    }
                });
                
            if (queryResult.size === 0) return [];
            const placeIdxSet = new Set([...queryResult.values()].map(q => q.placeIdx));
            const images = await pool.queryParam(`SELECT placeIdx, placeImageUrl, thumbnailImage FROM PLACEIMAGE_TB WHERE placeIdx IN (${[...placeIdxSet].length === 1 ? [...placeIdxSet].join('') : [...placeIdxSet].join(', ').slice(0, -2)})`);
            images.forEach(img => {
                if(queryResult.has(img.placeIdx)) {
                    queryResult.get(img.placeIdx).imageUrl.push(img.placeImageUrl);
                }
            });

            queryResult.get(placeIdx).likes.push({
                likeCnt: likeCntResult[0].likeCnt, 
                isLiked : isLikedResult[0].isLiked,
                bookmarked : isBookmarkedResult[0].isBookmarked
            })
            return [...queryResult.values()];
        } catch(e) {
            throw e;
        }
    },

    getPlacesByGroup: async (groupIdx, queryObject) => {
        try {
            const tagTable = tableModule.getTag();
            const categoryTable = tableModule.getCategory();
            const subwayTable = tableModule.getSubwayGroup();

            let placeTable = `SELECT * FROM ${table} WHERE groupIdx=${groupIdx}`;
            if (queryObject.categoryIdx !== undefined) placeTable += ` and categoryIdx=${queryObject.categoryIdx}`;
            
            const placeTagQuery = `SELECT * FROM 
                (SELECT * FROM (${placeTable}) as PLACE natural left outer join PLACE_TAG_RELATION_TB) as PLACETAG 
                natural left outer join USER_TB`;
            const placeSubwayQuery = `SELECT * FROM 
                (SELECT * FROM (${placeTable}) as PLACE natural left outer join SUBWAY_PLACE_RELATION_TB) as PLACESUBWAY 
                natural left outer join USER_TB`;
            
            const queryResult = new Map();
            
            (await pool.queryParam(placeTagQuery)).concat(await pool.queryParam(placeSubwayQuery))
                .forEach(ele => {
                    if(queryResult.has(ele.placeIdx)) {
                        if (!_.isNil(ele.tagIdx)) queryResult.get(ele.placeIdx).tag.push(tagTable.find(tag => tag.tagIdx === ele.tagIdx));
                        if (!_.isNil(ele.subwayIdx)) queryResult.get(ele.placeIdx).subway.push(subwayTable.find(sub => sub.subwayIdx === ele.subwayIdx));
                    } else {
                        queryResult.set(ele.placeIdx, {
                            placeIdx: ele.placeIdx,
                            placeName: ele.placeName,
                            placeAddress: ele.placeAddress,
                            placeRoadAddress: ele.placeRoadAddress,
                            placeMapX: ele.placeMapX,
                            placeMapY: ele.placeMapY,
                            placeCreatedAt: ele.placeCreatedAt,
                            placeUpdatedAt: ele.placeUpdatedAt,
                            
                            placeReview: ele.placeReview,
                            category: categoryTable.find(category => category.categoryIdx === ele.categoryIdx),
                            groupIdx: ele.groupIdx,
                            placeViews: ele.placeViews,
                            tag: _.isNil(ele.tagIdx) ? [] : [tagTable.find(tag => tag.tagIdx === ele.tagIdx)],
                            subway: _.isNil(ele.subwayIdx) ? [] : [subwayTable.find(ele.subwayIdx)],
                            user: {
                                userIdx: ele.userIdx,
                                userName: ele.userName ? ele.userName : '',
                                email: ele.email ? ele.email : '',
                                profileURL: ele.profileImageUrl ? ele.profileImageUrl : ''
                            },
                            imageUrl: []
                        });
                    }
                });

            if (queryResult.size === 0) return [];
            const placeIdxSet = new Set([...queryResult.values()].map(q => q.placeIdx));

            const images = await pool.queryParam(`SELECT placeIdx, placeImageUrl, thumbnailImage FROM PLACEIMAGE_TB WHERE placeIdx IN (${placeIdxSet.size === 1 ? [...placeIdxSet].join('') : [...placeIdxSet].join(', ')})`);
            
            images.forEach(img => {
                if(queryResult.has(img.placeIdx)) queryResult.get(img.placeIdx).imageUrl.push(img.placeImageUrl);
            });

            // tag, subway로 필터링
            let result = [...queryResult.values()];

            if(_.isNil(queryObject.categoryIdx)) return result;

            if (!_.isNil(queryObject.tagIdx)) {
                result = result.filter(ele => {
                    for (let tagIdx of queryObject.tagIdx.split(',')) {
                        if (ele.tag.findIndex(tag => tag.tagIdx === tagIdx * 1) === -1) return false;
                    }
                    return true;
                });
            }
            if (!_.isNil(queryObject.subwayIdx)) {
                result = result.filter(ele => {
                    for (let subwayIdx of queryObject.subwayIdx.split(',')) {
                        if (ele.subway.findIndex(sub => sub.subwayIdx === subwayIdx * 1) !== -1) return true;
                    }
                    return false;
                });
            }
            console.log('GET places in group');
            return result;
        } catch(e) {
            throw e;
        }
    },

    getPlacesByQuery: async (groupIdx, query) => {
        try {
            const subwayTable = tableModule.getSubwayGroup();
            const tagTable = tableModule.getTag();
            const categoryTable = tableModule.getCategory();

            const placeTable = `SELECT * FROM ${table} WHERE groupIdx=${groupIdx} AND (placeName LIKE "%${query}%")`;
            const placeTagQuery = `SELECT * FROM (SELECT * FROM (${placeTable}) as PLACE natural left outer join PLACE_TAG_RELATION_TB) as PLACETAG natural left outer join USER_TB`;
            const placeSubwayQuery = `SELECT * FROM (SELECT * FROM (${placeTable}) as PLACE natural left outer join SUBWAY_PLACE_RELATION_TB) as PLACESUBWAY natural left outer join USER_TB`;
            const queryResult = new Map();

            (await pool.queryParam(placeTagQuery)).concat(await pool.queryParam(placeSubwayQuery))
                .forEach(ele => {
                    if(queryResult.has(ele.placeIdx)) {
                        if (!_.isNil(ele.tagIdx)) queryResult.get(ele.placeIdx).tag.push(tagTable.find(tag => tag.tagIdx === ele.tagIdx));
                        if (!_.isNil(ele.subwayIdx)) queryResult.get(ele.placeIdx).subway.push(subwayTable.find(sub => sub.subwayIdx === ele.subwayIdx));
                    } else {
                        queryResult.set(ele.placeIdx, {
                            placeIdx: ele.placeIdx,
                            placeName: ele.placeName,
                            placeAddress: ele.placeAddress,
                            placeRoadAddress: ele.placeRoadAddress,
                            placeMapX: ele.placeMapX,
                            placeMapY: ele.placeMapY,
                            placeCreatedAt: ele.placeCreatedAt,
                            placeUpdatedAt: ele.placeUpdatedAt,
                            
                            placeReview: ele.placeReview,
                            category: categoryTable.find(category => category.categoryIdx === ele.categoryIdx),
                            groupIdx: ele.groupIdx,
                            placeViews: ele.placeViews,
                            tag: _.isNil(ele.tagIdx) ? [] : [tagTable.find(tag => tag.tagIdx === ele.tagIdx)],
                            subway: _.isNil(ele.subwayIdx) ? [] : [subwayTable.find(sub => sub.subwayIdx === ele.subwayIdx)],
                            user: {
                                userIdx: ele.userIdx,
                                userName: ele.userName ? ele.userName : '',
                                email: ele.email ? ele.email : '',
                                profileURL: ele.userProfileImageUrl ? ele.userProfileImageUrl : ''
                            },
                            imageUrl: []
                        });
                    }
                });

            if (queryResult.size === 0) return [];
            const placeIdxSet = new Set([...queryResult.values()].map(q => q.placeIdx));
            const images = await pool.queryParam(`SELECT placeIdx, placeImageUrl, thumbnailImage FROM PLACEIMAGE_TB WHERE placeIdx IN (${[...placeIdxSet].length === 1 ? [...placeIdxSet].join('') : [...placeIdxSet].join(', ').slice(0, -2)})`);

            images.forEach(img => {
                if(queryResult.has(img.placeIdx)) queryResult.get(img.placeIdx).imageUrl.push(img.placeImageUrl);
            });
            
            return [...queryResult.values()];
        } catch(e) {
            throw e;
        }
        
    },
    addPlace : async ({title, address, roadAddress, mapx, mapy, placeReview, categoryIdx, groupIdx, tags, infoTags, subwayIdx, userIdx, imageUrl}) => {
        const nowUnixTime= parseInt(moment().format('X'));
        const addPlaceQuery = `INSERT INTO ${table} (placeName, placeAddress, placeRoadAddress, placeMapX, placeMapY, placeCreatedAt, placeUpdatedAt, userIdx, placeReview, categoryIdx, groupIdx) VALUES (?,?,?,?,?,?,?,?,?,?,?)`;
        const addPlaceValues =[title, address, roadAddress, mapx, mapy, nowUnixTime, nowUnixTime, userIdx, placeReview, categoryIdx,groupIdx];
        const addPlaceImageQuery = `INSERT INTO ${placeImageTB} (placeIdx, placeImageUrl) VALUES(?,?)`;
        const addPlaceTagQuery = `INSERT INTO ${placeTagTB} (placeIdx, tagIdx) VALUES (?,?)`;
        const addPlaceSubwayQuery = `INSERT INTO ${subwayPlaceTB} (subwayIdx, placeIdx) VALUES (?,?)`;
        const getPlaceIdxQuery = `SELECT placeIdx FROM ${table} where groupIdx =${groupIdx} and placeMapX = ${mapx} and placeMapY = ${mapy}`;
        let addPlaceImageResult = [];
        let addPlaceTagRelationResult = [];
        let addPlaceSubwayRelationResult = [];
        let tagIdxData = [...tags, ...infoTags];
        console.log(tagIdxData)
        try{
            await pool.Transaction( async (conn) =>{
                let addPlaceResult = await conn.query(addPlaceQuery,addPlaceValues);
                let getPlaceIdsResult = await conn.query(getPlaceIdxQuery,[groupIdx,mapx,mapy]);
                let placeIdx = addPlaceResult.insertId;
                
                for(let i = 0; i<imageUrl.length; i++){
                    await conn.query(addPlaceImageQuery,[placeIdx, imageUrl[i]]);
                }
            
                for(let i = 0; i<tagIdxData.length; i++){
                    let tagData = await conn.query(addPlaceTagQuery,[parseInt(placeIdx),parseInt(tagIdxData[i])]);
                }

                for(let i in subwayIdx){
                    let subwayData = await conn.query(addPlaceSubwayQuery,[parseInt(subwayIdx[i]),parseInt(placeIdx)]);
                }                
            }).catch((err)=>{
                console.log('장소 추가 트랜잭션 오류! :',err)
                throw err;
            })
        }catch(e){
            console.log("장소 추가 에러 :", e);
            throw(e);
        }
    },
    addLike : async ({userIdx,placeIdx}) =>{
        const nowUnixTime= parseInt(moment().format('X'));
        const addLikeQuery = `INSERT INTO ${likeTB} (userIdx,placeIdx,likeCreatedAt) VALUES (?,?,?)`
        try{
            const addLikeResult = await pool.queryParamArr(addLikeQuery,[userIdx, placeIdx,nowUnixTime]);
            return addLikeResult.insertId;
        }catch(err){
            console.log('addLike 에러',err);
            throw err;
        }
    },
    isCheckPlace : async (placeIdx) =>{
        const isCheckPlace = `SELECT * FROM ${table} WHERE placeIdx = ${placeIdx}`;
        try{
            const result = await pool.queryParam(isCheckPlace);
            return result;
        }catch(err){
            console.log('place 체크 오류', err);
            throw err;
        }
    },
    deleteLike : async ({userIdx,placeIdx}) =>{
        const deleteLikeQuery = `DELETE FROM ${likeTB} WHERE userIdx = ${userIdx} and ${placeIdx}`;
        try{
            const result = await pool.queryParam(deleteLikeQuery);
            return result;
        }catch(err){
            console.log('deleteLike 에러', err);
            throw err;
        }
    },
    getLikeIdx : async({userIdx,placeIdx}) =>{
        const getLikeQuery = `SELECT * FROM ${likeTB} WHERE userIdx = ${userIdx} and placeIdx = ${placeIdx}`;
        try{
            const result = await pool.queryParam(getLikeQuery);
            return result;
        }catch(err){
            console.log('get Like err', err);
            throw err;
        }
    },
    getLikeList : async(placeIdx) =>{
        const getLikeListQuery = `select l.userIdx, u.userName, u.profileImageUrl, l.likeCreatedAt,
                                from ${likeTB} as l 
                                LEFT JOIN ${userTB} as u on l.userIdx = u.userIdx 
                                where placeIdx = ${placeIdx}`;
        try{
            const result =await pool.queryParam(getLikeListQuery);
            return result;
        }catch(err){
            console.log('get like list err', err);
            throw err;
        }
    },
    getBookmarkIdx : async({userIdx,placeIdx}) =>{
        const getBookmarkQuery = `SELECT * FROM ${bookmarkTB} WHERE userIdx = ${userIdx} and placeIdx = ${placeIdx}`;
        try{
            const result = await pool.queryParam(getBookmarkQuery);
            return result;
        }catch(err){
            console.log('get bookmarkIdx err', err);
            throw err;
        }
    },
    addBookmark : async ({userIdx,placeIdx}) =>{
        const addBookmarkQuery = `INSERT INTO ${bookmarkTB} (userIdx,placeIdx) VALUES (?,?)`
        try{
            const addBookmarkResult = await pool.queryParamArr(addBookmarkQuery,[userIdx, placeIdx]);
            return addBookmarkResult.insertId;
        }catch(err){
            console.log('add bookmark 에러',err);
            throw err;
        }
    },
    deleteBookmark : async ({userIdx,placeIdx}) =>{
        const deleteBookmarkQuery = `DELETE FROM ${bookmarkTB} WHERE userIdx = ${userIdx} and ${placeIdx}`;
        try{
            const result = await pool.queryParam(deleteBookmarkQuery);
            return result;
        }catch(err){
            console.log('delete bookmark 에러', err);
            throw err;
        }
    },
    getOnePlace : async ({userIdx, placeIdx}) =>{
        const placeQuery = `SELECT categoryIdx, placeName, placeReview, placeCreatedAt, placeRoadAddress FROM ${table} WHERE placeIdx =${placeIdx}`;
        const subwayNameQuery = `SELECT * FROM ${subwayTB} WHERE subwayIdx IN (SELECT subwayIdx FROM ${table} as p LEFT JOIN ${subwayPlaceTB} as r on p.placeIdx=r.placeIdx WHERE p.placeIdx = ${placeIdx})`;
        const placeImageQuery = `SELECT * FROM ${placeImageTB} WHERE placeIdx = ${placeIdx}`;
        const tagQuery = `SELECT tagName, tagIsBasic FROM PLACE_TAG_RELATION_TB as p LEFT JOIN TAG_TB as t on p.tagIdx = t.tagIdx WHERE placeIdx = ${placeIdx}`;
        const isBookmarkedQuery = `SELECT * FROM ${bookmarkTB} WHERE userIdx = ${userIdx} and placeIdx = ${placeIdx}`;
        const isLikedQuery = `SELECT * FROM ${likeTB} WHERE userIdx = ${userIdx} and placeIdx = ${placeIdx}`;
        const likeCountQuery = `SELECT COUNT(*) as likeCnt FROM ${likeTB} WHERE userIdx = ${userIdx} and placeIdx = ${placeIdx}`;
        const bookmarkCountQuery = `SELECT COUNT(*) as bookmarkCnt FROM ${bookmarkTB} WHERE userIdx = ${userIdx} and placeIdx = ${placeIdx}`;
        const userQuery = `SELECT u.userName, u.profileImageUrl, g.part 
                        FROM USER_TB as u LEFT JOIN GROUP_USER_RELATION_TB as g on u.userIdx= g.userIdx 
                        WHERE groupIdx = (SELECT groupIdx FROM PLACE_TB WHERE placeIdx = ${placeIdx}) and u.userIdx = (SELECT userIdx FROM PLACE_TB WHERE placeIdx =${placeIdx});;`
        const postQuery = `SELECT COUNT(*) as postCount FROM PLACE_TB WHERE userIdx = ${userIdx} and groupIdx =(SELECT groupIdx FROM PLACE_TB WHERE placeIdx = ${placeIdx})`
        const getLikeListQuery = `SELECT u.userName, u.profileImageUrl, l.likeCreatedAt, u.part 
                                    FROM LIKE_TB as l
                                    LEFT JOIN (SELECT u.userIdx, u.userName, u.profileImageUrl, g.part FROM USER_TB as u 
                                    LEFT JOIN GROUP_USER_RELATION_TB as g on u.userIdx= g.userIdx 
                                    WHERE groupIdx = (SELECT groupIdx FROM PLACE_TB WHERE placeIdx = ${placeIdx})) as u on l.userIdx = u.userIdx 
                                    where placeIdx = ${placeIdx};`;
        const isMyPlaceQuery = `SELECT u.userIdx, p.placeIdx FROM USER_TB as u LEFT JOIN PLACE_TB as p on u.userIdx = p.userIdx WHERE u.userIdx = ${userIdx} and p.placeIdx = ${placeIdx}`;
        try{
            let retObj = {};
            const placeResult = await pool.queryParam(placeQuery);
            const subwayName = await pool.queryParam(subwayNameQuery);
            const placeImageUrl = await pool.queryParam(placeImageQuery);
            const tag = await pool.queryParam(tagQuery);
            const isLikedResult = await pool.queryParam(isLikedQuery);
            const isBookmarkedResult = await pool.queryParam(isBookmarkedQuery);
            const likeCount = await pool.queryParam(likeCountQuery);
            const bookmarkCount = await pool.queryParam(bookmarkCountQuery);
            const writer = await pool.queryParam(userQuery);
            const postCount = await pool.queryParam(postQuery);
            const likeInteraction = await pool.queryParam(getLikeListQuery);
            const isMyPlaceResult = await pool.queryParam(isMyPlaceQuery);
            console.log(!_.isNil(isMyPlaceResult[0]))

            retObj = {...placeResult[0]};
            retObj.isLiked = !_.isNil(isLikedResult[0]);
            retObj.isBookmarked = !_.isNil(isBookmarkedResult[0]);
            retObj.likeCount = likeCount[0].likeCnt;
            retObj.bookmarkCount = bookmarkCount[0].bookmarkCnt;

            retObj.subway = [];
            for(let it in subwayName){
                retObj.subway.push(subwayName[it].subwayName);
            }

            retObj.imageUrl = [];
            for(let it in placeImageUrl){
                retObj.imageUrl.push(placeImageUrl[it].placeImageUrl);
            }

            retObj.keyword = [];
            retObj.placeInfo = [];

            for(let it in tag){
                if(tag[it].tagIsBasic === 0){
                    retObj.keyword.push(tag[it].tagName);
                }else{
                    retObj.placeInfo.push(tag[it].tagName)
                }
            }
            writer[0].postCount = postCount[0].postCount; 
            writer[0].deleteBtn = !_.isNil(isMyPlaceResult[0]);
            retObj.uploader = writer[0];
            retObj.likeList = [];
            for(let it in likeInteraction){
                retObj.likeList.push(likeInteraction[it])
            }
            return retObj;
        }catch(err){
            console.log('get one place err', err);
            throw err;
        }
    },
    deletePlace : async(placeIdx) =>{
        const deleteImageQuery = `DELETE FROM PLACEIMAGE_TB WHERE placeIdx = ?`;
        const deleteTagQuery = `DELETE FROM PLACE_TAG_RELATION_TB WHERE placeIdx = ?`;
        const deleteSubwayQuery = `DELETE FROM SUBWAY_PLACE_RELATION_TB WHERE placeIdx = ?`;
        const deletePlaceQuery = `DELETE FROM PLACE_TB WHERE placeIdx = ? `;
        try{
            await pool.Transaction( async (conn)=>{
                await conn.query(deleteImageQuery, placeIdx);
                await conn.query(deleteTagQuery, placeIdx);
                await conn.query(deleteSubwayQuery, placeIdx);
                await conn.query(deletePlaceQuery, placeIdx)
                //like
                //bookmark
            }).catch((err)=>{
                console.log('장소 삭제 트랜잭션 오류');
                throw err;
            })
        }catch(err){
            console.log('delete Place error',err);
            throw(err);
        }
    },
    isMyPlacePost : async(userIdx, placeIdx) =>{
        const query = `SELECT * FROM PLACE_TB WHERE placeIdx = ${placeIdx} and userIdx = ${userIdx}`;
        try{
            const result = await pool.queryParam(query);
            return result[0];
        }catch(err){
            console.log('isMyPlacePost err', err);
            throw err;
        }
    }
}

module.exports = place;