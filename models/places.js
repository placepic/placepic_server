const _ = require('lodash');
const pool = require('../modules/pool');
const table = 'PLACE_TB';

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
            
            const placeTagQuery = `SELECT * FROM (${placeTable}) as PLACE natural left outer join PLACE_TAG_RELATION_TB`;
            const placeSubwayQuery = `SELECT * FROM (${placeTable}) as PLACE natural left outer join SUBWAY_PLACE_RELATION_TB`;
            
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
                            userIdx: ele.userIdx,
                            placeReview: ele.placeReview,
                            category: categoryTable.find(category => category.categoryIdx === ele.categoryIdx),
                            groupIdx: ele.groupIdx,
                            placeViews: ele.placeViews,
                            tag: _.isNil(ele.tagIdx) ? [] : [tagTable.find(tag => tag.tagIdx === ele.tagIdx)],
                            subway: _.isNil(ele.subwayIdx) ? [] : [subwayTable.find(sub => sub.subwayIdx === ele.subwayIdx)],
                        });
                    }
                });
            // tag, subway로 필터링
            let result = [...queryResult.values()];
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
}

module.exports = place;