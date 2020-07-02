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
    getPlacesByGroup: async (groupIdx) => {
        const query = `SELECT * FROM ${table} WHERE groupIdx=${groupIdx}`;
        try {
            const result = await pool.queryParam(query);
            return result;
        } catch(e) {
            throw e;
        }
    }
}

module.exports = place;