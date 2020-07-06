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
    getPlacesByGroup: async (groupIdx) => {
        const query = `SELECT * FROM ${table} WHERE groupIdx=${groupIdx}`;
        try {
            const result = await pool.queryParam(query);
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