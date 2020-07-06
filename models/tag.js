const pool = require('../modules/pool');
const tagTable = 'TAG_TB';
const DEFAULT_TAG = 1;
const CATEGORY_TAG = 0;

const tag = {
    getCategoryTags : async(categoryIdx) =>{
        const onlyCategoryTagQuery = `SELECT * FROM ${tagTable} WHERE categoryIdx = ${categoryIdx} and tagIsBasic = "${CATEGORY_TAG}"`;
        try{
            const categoryTagDto = await pool.queryParam(onlyCategoryTagQuery);
            return categoryTagDto;
        }catch(err){
            console.log('getCategoryTags err :',err);
            throw(err);
        }
    },
    getCategoryDefaultTags: async(categoryIdx) =>{
        const categoryDefaultTagQuery = `SELECT * FROM ${tagTable} WHERE categoryIdx = ${categoryIdx} and tagIsBasic = "${DEFAULT_TAG}"`;
        try{
            const categoryDefaultDto = await pool.queryParam(categoryDefaultTagQuery);
            return categoryDefaultDto;
        }catch(err){
            console.log('getCategoryDefaultTags err :', err);
            throw(err);
        }
    },
    getCategoryTags : async (categoryIdx) =>{
        const categoryTagsQuery = `SELECT * FROM ${tagTable} WHERE categoryIdx = ${categoryIdx}`;
        try{
            const categoryTagsDto =await pool.queryParam(categoryTagsQuery);
            return categoryTagsDto;
        }catch(err){
            console.log('getCategoryTags err :', err);
            throw(err);
        }
    }
}

module.exports = tag;