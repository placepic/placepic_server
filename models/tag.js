const pool = require('../modules/pool');
const tagTable = 'TAG_TB';
const DEFAULT_TAG = 1;
const CATEGORY_TAG = 0;
const table = require('../modules/table');

const tag = {
    getAllTags : async() =>{
        try{
            const allTagsDto = table.getTag();
            console.log(allTagsDto);
            return allTagsDto;
        }catch(err){
            console.log('get All Tags error:', err);
            throw(err);
        }
    },
    getCategoryTags : async(categoryIdx) =>{
        try{
            let allTagsDto = table.getTag();
            const categoryTagDto = allTagsDto.filter((it)=>it.categoryIdx === parseInt(categoryIdx) && it.tagIsBasic === CATEGORY_TAG);
            return categoryTagDto;
        }catch(err){
            console.log('getCategoryTags err :',err);
            throw(err);
        }
    },
    getCategoryDefaultTags: async(categoryIdx) =>{
        try{
            let allTagsDto = table.getTag();
            const categoryDefaultTagDto = allTagsDto.filter((it)=>it.categoryIdx === parseInt(categoryIdx) && it.tagIsBasic === DEFAULT_TAG);
            return categoryDefaultTagDto;
        }catch(err){
            console.log('getCategoryDefaultTags err :', err);
            throw(err);
        }
    }
}
module.exports = tag;
    /*
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
    getCategoryTags : async (categoryIdx) =>{ // 카테고리별로 태그 주기
        const categoryTagsQuery = `SELECT * FROM ${tagTable} WHERE categoryIdx = ${categoryIdx}`;
        try{
            const categoryTagsDto =await pool.queryParam(categoryTagsQuery);
            return categoryTagsDto;
        }catch(err){
            console.log('getCategoryTags err :', err);
            throw(err);
        }
    },
    getAllTags : async () =>{
        const tagsQuery = `SELECT * FROM ${tagTable}`;
        try{
            const tagDto = await pool.queryParam(tagsQuery);
            return tagDto;
        }catch(err){
            console.log('all Tags err : ', err);
            throw(err);
        }
    }
    */