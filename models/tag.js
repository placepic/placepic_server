const pool = require('../modules/pool');
const tagTable = 'TAG_TB';
const DEFAULT_TAG = 1;
const CATEGORY_TAG = 0;
const table = require('../modules/table');

const tag = {
    getAllTags : () =>{
        try{
            const allTagsDto = table.getTag();
            console.log(allTagsDto);
            return allTagsDto;
        }catch(err){
            console.log('get All Tags error:', err);
            throw(err);
        }
    },
    getCategoryTags : (categoryIdx) =>{
        try{
            let allTagsDto = table.getTag();
            const categoryTagDto = allTagsDto.filter((it)=>it.categoryIdx === parseInt(categoryIdx) && it.tagIsBasic === CATEGORY_TAG);
            return categoryTagDto;
        }catch(err){
            console.log('getCategoryTags err :',err);
            throw(err);
        }
    },
    getCategoryDefaultTags: (categoryIdx) =>{
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
