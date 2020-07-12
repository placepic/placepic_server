const _ = require('lodash');
const pool = require('../modules/pool');
const table = 'PLACE_TB';
const placeImageTB = 'PLACEIMAGE_TB';
const placeTagTB = 'PLACE_TAG_RELATION_TB';
const moment = require('moment');
const subwayPlaceTB = 'SUBWAY_PLACE_RELATION_TB';

const tableModule = require('../modules/table');

const place = {
    getAllPlaces: async () => {
        try {
            return await pool.queryParam(`SELECT * FROM ${table}`);
        } catch (e) {
            throw e;
        }
    },
    getPlace: async (placeIdx) => {
        try {
            const tagTable = tableModule.getTag();
            const categoryTable = tableModule.getCategory();
            const subwayTable = tableModule.getSubwayGroup();
            
            let placeTable = `SELECT * FROM ${table} WHERE placeIdx=${placeIdx}`;
            
            const placeTagQuery = `SELECT * FROM 
                (SELECT * FROM (${placeTable}) as PLACE natural left outer join PLACE_TAG_RELATION_TB) as PLACETAG 
                natural left outer join USER_TB`;
            const placeSubwayQuery = `SELECT * FROM
                (SELECT * FROM (${placeTable}) as PLACE natural left outer join SUBWAY_PLACE_RELATION_TB)
                as PLACESUBWAY natural left outer join USER_TB`;
            
            const queryResult = new Map();
            (await pool.queryParam(placeTagQuery)).concat(await pool.queryParam(placeSubwayQuery))
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
                            placeUpdatedAt: ele.placeUpdatedAt,
                            placeReview: ele.placeReview,
                            category: categoryTable.find(category => category.categoryIdx === ele.categoryIdx),
                            groupIdx: ele.groupIdx,
                            placeViews: ele.placeViews,
                            tag: _.isNil(ele.tagIdx) ? [] : [tagTable.find(tag => tag.tagIdx === ele.tagIdx)],
                            subway: _.isNil(ele.subwayIdx) ? [] : [subwayTable.find(subway => subway.subwayIdx === ele.subwayIdx)],
                            user: {
                                userIdx: ele.userIdx,
                                userName: _.isNil(ele.userName) ? '' : ele.userName,
                                email: _.isNil(ele.email) ? '' : ele.email,
                                profileURL: _.isNil(ele.userProfileImageUrl) ? '' : ele.userProfileImageUrl
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
                        console.log(ele);
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
        let tagIdxData = [...tags, ...infoTags];
        try{
             pool.Transaction( async (conn) =>{
                let addPlaceResult = await conn.query(addPlaceQuery,addPlaceValues);
                let getPlaceIdsResult = await conn.query(getPlaceIdxQuery,[groupIdx,mapx,mapy]);
                let placeIdx = addPlaceResult.insertId;
                let addPlaceImageResult = [];
                let addPlaceTagRelationResult = [];
                let addPlaceSubwayRelationResult = [];
                for(let i = 0; i<imageUrl.length; i++){
                    addPlaceImageResult.push(await conn.query(addPlaceImageQuery,[placeIdx, imageUrl[i]]));
                }
            
                for(let i = 0; i<tagIdxData.length; i++){
                    let tagData = await conn.query(addPlaceTagQuery,[parseInt(placeIdx),parseInt(tagIdxData[i])]);
                    addPlaceTagRelationResult.push(tagData);
                }
                
                console.log(subwayIdx);
                if(Array.isArray(subwayIdx)){
                    for(let i = 0; i<subwayIdx.length; i++){
                        let subwayData = await conn.query(addPlaceSubwayQuery,[parseInt(subwayIdx[i]),parseInt(placeIdx)]);
                        addPlaceSubwayRelationResult.push(subwayData);
                    }
                }else{
                    let subwayData = await conn.query(addPlaceSubwayQuery,[parseInt(subwayIdx),parseInt(placeIdx)]);
                    addPlaceSubwayRelationResult.push(subwayData);
                }
                
                console.log('장소 추가 완료.');
            }).catch((err)=>{
                console.log('장소 추가 오류! :',err)
                throw err;
            })
        }catch(e){
            console.log("장소 추가 에러 :", e);
            throw(e);
        }
    }
}

module.exports = place;