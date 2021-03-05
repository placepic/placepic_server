const pool = require('../modules/pool');
const categoryTable = 'CATEGORY_TB';
const table = require('../modules/table');

const category = {
    getCategory: () => {
        try {
            const allCategoryDto = table.getCategory();
            return allCategoryDto;
        } catch (err) {
            console.log('read all Category data ERROR : ' + err);
            throw err;
        }
    },
    getOneCategory: (categoryIdx) => {
        try {
            const oneCategoryDto = table.getOneCategory(categoryIdx);
            return oneCategoryDto;
        } catch (err) {
            console.log('read one category data ERROR : ' + err);
            throw err;
        }
    },
};

module.exports = category;
