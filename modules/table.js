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
    queryResult.subwayAndLine = await pool.queryParam(`SELECT ${table.subway}.subwayIdx, ${table.subway}.subwayName, ${table.subwayLine}.subwayLineNumber FROM ${table.subway} LEFT JOIN ${table.subwayLine} ON ${table.subway}.subwayIdx = ${table.subwayLine}.subwayIdx`);
    console.log(queryResult.subwayAndLine);
})();

module.exports = {
    getCategory: () => queryResult.category,
    getTag: () => queryResult.tag,
    getSubway: () => queryResult.subway,
    getOneCategory : (categoryIdx) => queryResult.category[parseInt(categoryIdx)-1],
    getSubwayJoinLine : () => queryResult.subwayAndLine,
    getSubwayWithSubwayLine: (subwayIdx) => {
        const subwayMap = new Map();
        queryResult.subway.forEach(sub => {
            subwayMap.set(sub.subwayIdx, {
                subwayIdx: sub.subwayIdx,
                subwayName: sub.subwayName,
                subwayLine: queryResult.subwayLine.filter(subLine => subLine.subwayIdx === sub.subwayIdx)
                    .map(ele => ele.subwayLineNumber
                    //     {
                    //     const newEle = _.clone(ele);
                    //     delete newEle.subwayIdx;
                    //     return newEle;
                    // }
                    ),
            });
        });
        if (subwayIdx !== undefined) return [...subwayMap.values()].filter(sub => sub.subwayIdx === subwayIdx)[0];
        else return [...subwayMap.values()];
    }
};
