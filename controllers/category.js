const category = require('../models/category');
const ut = require('../modules/util');
const rm = require('../modules/responseMessage');
const sc = require('../modules/statusCode');

module.exports = {
    readCategory: async (req, res) => {
        try {
            const userIdx = 2;
            const allCategory = await category.getCategory();
            return await res.status(sc.OK).send(ut.success(rm.READ_CATEGORY, allCategory));
        }catch(err){
            if(err){
                return await res.status(sc.INTERNAL_SERVER_ERROR).send(ut.fail(rm.SERVER_ERROR));
            }
        }
    }
}