const table = 'BANNER_TB';
const pool = require('../modules/pool');
const moment = require('moment');

const banner = {
    getAllBanners: async () => {
        try {
            const bannerQuery = `SELECT * FROM ${table}`;
            const bannerList = await pool.queryParam(bannerQuery);
            return bannerList;
        } catch (err) {
            throw err;
        }
    },
    getBanner: async(bannerIdx) => {
        try {
            const bannerQuery = `SELECT * FROM ${table} WHERE bannerIdx = ${bannerIdx};`;
            const banner = (await pool.queryParam(bannerQuery))[0];
            return banner;
        } catch (err) {
            throw err;
        }
    },
    getBannersByGroup: async (groupIdx) => {
        const bannerQuery = `SELECT * FROM BANNER_TB WHERE groupIdx = ${groupIdx}`;
        try {
            const bannerList = await pool.queryParam(bannerQuery);
            return bannerList;
        } catch (err) {
            throw err;
        }
    },
    addBanner: async (bannerTitle, bannerBadgeName, bannerBadgeColor, bannerDescription, bannerImageUrl, groupIdx) => {
        const bannerQuery = `INSERT INTO ${table}
            ( bannerTitle, bannerBadgeName, bannerBadgeColor, bannerDescription, bannerCreatedAt, bannerImageUrl, groupIdx) VALUES (?,?,?,?,?,?,?)`;
        const nowUnixTime = parseInt(moment().format('X'));
        try {
            const result = await pool.queryParamArr(bannerQuery, [bannerTitle, bannerBadgeName, bannerBadgeColor, bannerDescription, nowUnixTime, bannerImageUrl, groupIdx]);
            return result;
        } catch(err) {
            throw err;
        }
    },
    deleteBanner: async (bannerIdx) => {
        const bannerQuery = `DELETE FROM ${table} WHERE bannerIdx = ${bannerIdx}`;
        try {
            const result = await pool.queryParam(bannerQuery);
            return result;
        } catch(err) {
            throw err;
        }
    },
    addBannerPlace: async (bannerIdx, placeIdx) => {
        const bannerQuery = `INSERT INTO PLACE_BANNER_RELATION_TB (placeIdx, bannerIdx) VALUES (?,?)`;
        try {
            const result = await pool.queryParamArr(bannerQuery, [placeIdx, bannerIdx]);
            return result;
        } catch(err) {
            throw err;
        }
    },
    addBannerPlaces: async (bannerIdx, placeList) => {
        try {
            const promises = [];
            placeList.forEach(placeIdx => promises.push(pool.queryParam(`INSERT INTO PLACE_BANNER_RELATION_TB (placeIdx, bannerIdx) VALUES (${placeIdx}, ${bannerIdx})`)));
            return await Promise.all(promises);
        } catch(e) {
            throw err;
        }
    },
    deleteBannerPlace: async (bannerIdx, placeIdx) => {
        const bannerQuery = `DELETE FROM PLACE_BANNER_RELATION_TB WHERE placeIdx = ${placeIdx} and bannerIdx = ${bannerIdx}`;
        try {
            const result = await pool.queryParam(bannerQuery);
            return result;
        } catch(err) {
            throw err;
        }
    },
    checkBannerHasPlace: async (bannerIdx, placeIdx) => {
        const bannerQuery = `SELECT count(*) as cnt FROM PLACE_BANNER_RELATION_TB WHERE placeIdx = ${placeIdx} and bannerIdx = ${bannerIdx}`;
        try {
            const result = await pool.queryParamArr(bannerQuery, [placeIdx, bannerIdx]);
            if (result.cnt > 0) return true;
            return false;
        } catch(err) {
            throw err;
        }
    }
};


module.exports = banner;
