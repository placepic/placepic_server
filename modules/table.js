const _ = require('lodash');
const pool = require('./pool');

const table = {
    category: 'CATEGORY_TB',
    tag: 'TAG_TB',
    subway: 'SUBWAY_TB',
    subwayLine: 'SUBWAY_LINE_TB'
}

const queryResult = {};
(async () => {
    queryResult.category = await pool.queryParam(`SELECT * FROM ${table.category}`);
    queryResult.tag = await pool.queryParam(`SELECT * FROM ${table.tag}`);
    queryResult.subway = await pool.queryParam(`SELECT * FROM ${table.subway}`);
    queryResult.subwayLine = await pool.queryParam(`SELECT * FROM ${table.subwayLine}`);
    // queryResult.subwayAndLine = await pool.queryParam(`SELECT ${table.subway}.subwayIdx, ${table.subway}.subwayName, ${table.subwayLine}.subwayLineNumber FROM ${table.subway} LEFT JOIN ${table.subwayLine} ON ${table.subway}.subwayIdx = ${table.subwayLine}.subwayIdx`);
    queryResult.subwayAndLine = await pool.queryParam(`SELECT * FROM ${table.subway} NATURAL LEFT JOIN ${table.subwayLine};`);
    queryResult.tagName = await pool.queryParam(`SELECT tagIdx, tagName FROM ${table.tag}`);
})();

module.exports = {
    getCategory: () => queryResult.category,
    getTag: () => queryResult.tag,
    getSubway: () => queryResult.subway,
    getOneCategory : (categoryIdx) => queryResult.category[parseInt(categoryIdx)-1],
    getSubwayJoinLine : () => queryResult.subwayAndLine,
    getTagName : () => queryResult.tagName,
    getSubwayGroup: () => {
        return _(queryResult.subwayAndLine)
            .groupBy('subwayIdx')
            .values()
            .map(subArr => {
                let subwayObject;
                subArr.forEach((sub, i) => {
                    if (i === 0) {
                        subwayObject = {
                            subwayIdx: sub.subwayIdx,
                            subwayName: sub.subwayName,
                            subwayLine: [sub.subwayLine]
                        };
                    } else subwayObject.subwayLine.push(sub.subwayLine);
                });
                return subwayObject;
            }).value();
    },
};
