const _ = require('lodash');
const pool = require('./pool');

const table = {
    category: 'CATEGORY_TB',
    tag: 'TAG_TB',
    subway: 'SUBWAY_TB',
}

const queryResult = {};
(async () => {
    queryResult.category = await pool.queryParam(`SELECT * FROM ${table.category}`);
    queryResult.tag = await pool.queryParam(`SELECT * FROM ${table.tag}`);
    queryResult.subway = await pool.queryParam(`SELECT * FROM ${table.subway}`);
})();

module.exports = {
    getCategory: () => queryResult.category,
    getTag: () => queryResult.tag,
    getSubway: () => queryResult.subway,
    getOneCategory : (categoryIdx) => queryResult.category[parseInt(categoryIdx)-1]
    
};
