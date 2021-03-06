const moment = require('moment');
const _ = require('lodash');
const pool = require('../modules/pool');

const table = 'COMMENT_TB';

const comment = {
    createComment: async ({ userIdx, content, placeIdx, parentIdx }) => {
        const dateNow = parseInt(moment().format('X'));
        let query = `INSERT INTO ${table} (userIdx, content, placeIdx, createdAt, updatedAt) VALUES (?,?,?,?,?)`;
        let value = [userIdx, content, placeIdx, dateNow, dateNow];
        if (!_.isNil(parentIdx)) {
            query = `INSERT INTO ${table} (userIdx, content, placeIdx, parentIdx, createdAt, updatedAt) VALUES (?,?,?,?,?,?)`;
            value = [userIdx, content, placeIdx, parentIdx, dateNow, dateNow];
        }

        try {
            return await pool.queryParamArr(query, value);
        } catch (err) {
            throw err;
        }
    },
    getCommentsByPlaceIdx: async (placeIdx, groupIdx) => {
        const query = `SELECT * FROM ${table} WHERE placeIdx = ${placeIdx}`;
        try {
            const result = await pool.queryParam(query);
            result.map((comment) => {});
            return result;
        } catch (err) {
            throw err;
        }
    },
    getPostCount: async (userIdx, groupIdx) => {
        const query = `SELECT count(*) as postCount FROM PLACE_TB WHERE groupIdx = ${groupIdx} and userIdx = ${userIdx} GROUP BY groupIdx`;
        const result = pool
            .queryParam(query)
            .then((count) => {
                return count[0].postCount || 0;
            })
            .catch((err) => {
                throw err;
            });
        return result;
    },
};

module.exports = comment;
