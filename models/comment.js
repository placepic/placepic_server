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
};

module.exports = comment;
