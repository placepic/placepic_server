const category = require('../models/category');
const ut = require('../modules/util');
const rm = require('../modules/responseMessage');
const sc = require('../modules/statusCode');

module.exports = {
    readCategory: async (req, res) => {
        try {
            const allCategory = await category.getCategory();
            return await res.status(sc.OK).send(ut.success(sc.OK, rm.READ_CATEGORY, allCategory));
        }catch(err){
            if(err){
                return await res.status(sc.INTERNAL_SERVER_ERROR).send(ut.fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
            }
        }
    },
    readOneCategory: async (req, res) => {
        const{categoryIdx} = req.params;
        try {
            const oneCategory = await category.getOneCategory(categoryIdx);
            
            if(!categoryIdx) {
                console.log('필수 입력값을 입력해 주세요.');
                return await res.status(sc.BAD_REQUEST).send(ut.fail(sc.BAD_REQUEST,rm.NO_READ_CATEGORY));
            }
            
            let isTrue =categoryIdx>=1 && categoryIdx<=5 ? false : true 

            if(isTrue){
                console.log('범위를 벗어났습니다.');
                return await res.status(sc.BAD_REQUEST).send(ut.fail(sc.BAD_REQUEST,rm.OUT_OF_VALUE));
            }
            return await res.status(sc.OK).send(ut.success(sc.OK, rm.READ_CATEGORY, oneCategory));
        }catch(err){
            if(err){
                return await res.status(sc.INTERNAL_SERVER_ERROR).send(ut.fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
            }
        }
    }
}