const table = 'BANNER_TB';
const pool = require('../modules/pool');

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
};


module.exports = banner;
