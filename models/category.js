const pool = require('../modules/pool');
const categoryTable = 'CATEGORY_TB';

const category = {
    getCategory : async () =>{
        const query = `SELECT * FROM ${categoryTable}`;
        try{
            const allCategoryDto = await pool.queryParam(query);
            return allCategoryDto;
        } catch(err){
            console.log('read all Category data ERROR : '+ err);
            throw err;
        }
    },
    getOneCategory : async (categoryIdx) =>{
        const query = `SELECT * FROM ${categoryTable} WHERE categoryIdx = "${categoryIdx}"`;
        try{
            const oneCategoryDto = await pool.queryParam(query);
            return oneCategoryDto;
        }catch(err){
            console.log('read one category data ERROR : '+err);
            throw err;
        }
    }
}

module.exports = category;