const _ = require('lodash');
const pool = require('../modules/pool');
const table = 'PLACE_TB';
const placeImageTB = 'PLACEIMAGE_TB';
const placeTagTB = 'PLACE_TAG_RELATION_TB';
const moment = require('moment');

const place = {
    getAllPlaces: async () => {
        const query = `SELECT * FROM ${table}`;
        try {
            const result = await pool.queryParam(query);
            return result;
        } catch (e) {
            throw e;
        }
    },
    getPlace: async (placeIdx) => {
        const query = `SELECT * FROM ${table} WHERE placeIdx=${placeIdx}`;
        try {
            const result = await pool.queryParam(query);
            return result;
        } catch(e) {
            throw e;
        }
    },

    getPlacesByGroup: async (groupIdx, queryObject) => {
        try {
            const subwayTable = await pool.queryParam('SELECT * FROM SUBWAY_TB');
            const tagTable = await pool.queryParam('SELECT * FROM TAG_TB');
            const categoryTable = await pool.queryParam('SELECT * FROM CATEGORY_TB');

            let placeTable = `SELECT * FROM ${table} WHERE groupIdx=${groupIdx}`;
            if (queryObject.categoryIdx !== undefined) placeTable += ` and categoryIdx=${queryObject.categoryIdx}`;
            
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
                            }
                        });
                    }
                });
            
            
            // tag, subway로 필터링
            let result = [...queryResult.values()];
            if(_.isNil(queryObject.category)) return result;
            
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
            return result;
        } catch(e) {
            throw e;
        }
    },
    addPlace : async ({placeIdx, title, address, roadAddress, mapx, mapy, placeReview, categoryIdx, groupIdx, tags, infoTags, subwayName, subwayLine, userIdx, imageUrl}) => {
        const nowUnixTime= parseInt(moment().format('X'));
        const addPlaceQuery = `INSERT INTO ${table} (placeIdx, placeName, placeAddress, placeRoadAddress, placeMapX, placeMapY, placeCreatedAt, placeUpdatedAt, userIdx, placeReview, categoryIdx, groupIdx) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`;
        const addPlaceValues =[placeIdx, title, address, roadAddress, mapx, mapy, nowUnixTime, nowUnixTime, userIdx, placeReview, categoryIdx,groupIdx];
        const addPlaceImageQuery = `INSERT INTO ${placeImageTB} (placeIdx, placeImageUrl) VALUES(?,?)`;
        const addPlaceTagQuery = `INSERT INTO ${placeTagTB} (placeIdx, tagIdx) VALUES (?,?)`;
        let tagIdxData = [...tags, ...infoTags];
        try{
            pool.Transaction( async (conn) =>{
                let addPlaceResult = await conn.query(addPlaceQuery,addPlaceValues);
                let addPlaceImageResult = [];
                for(let i = 0; i<imageUrl.length; i++){
                    addPlaceImageResult.push(await conn.query(addPlaceImageQuery,[placeIdx, imageUrl[i]]));
                }
                let addPlaceTagRelationResult = [];
                for(let i = 0; i<tagIdxData.length; i++){
                    let tagData = await conn.query(addPlaceTagQuery,[parseInt(placeIdx),parseInt(tagIdxData[i])])
                    addPlaceTagRelationResult.push(tagData);
                }
                console.log('장소 추가 완료.');
            }).catch((err)=>{
                console.log('장소 추가 오류! :',err)
            })
        }catch(e){
            console.log("장소 추가 에러 :", e);
            throw(e);
        }
    }
}

module.exports = place;