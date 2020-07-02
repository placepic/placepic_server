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
    }
}

module.exports = category;