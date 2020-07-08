const ut = require('../modules/util');
const rm = require('../modules/responseMessage');
const sc = require('../modules/statusCode');
const tag = require('../models/tag');

module.exports = {
    readCategoryTags : async(req,res) =>{
        const {categoryIdx} = req.params;
        try{
            const categoryTags = await tag.getCategoryTags(categoryIdx);
            return await res.status(sc.OK).send(ut.success(sc.OK,rm.READ_TAG,categoryTags));
        }catch(err){
            console.log(err);
            return await res.status(sc.INTERNAL_SERVER_ERROR).send(ut.fail(sc.INTERNAL_SERVER_ERROR,rm.INTERNAL_SERVER_ERROR));
        }
    },
    readCategoryDefaultTags : async(req, res)=>{
        const {categoryIdx} = req.params;
        try{
            const defaultTags = await tag.getCategoryDefaultTags(categoryIdx);
            return await res.status(sc.OK).send(ut.success(sc.OK,rm.READ_TAG,defaultTags));
        }catch(err){
            console.log(err);
            return await res.status(sc.INTERNAL_SERVER_ERROR).send(ut.fail(sc.INTERNAL_SERVER_ERROR,rm.INTERNAL_SERVER_ERROR));
        }
    },
    readAllTags : async(req, res) =>{
        try{
            const allTagsData = await tag.getAllTags();
            return await res.status(sc.OK).send(ut.success(sc.OK,rm.READ_ALL_TAG,allTagsData));
        }catch(err){
            console.log(err);
            return await res.status(sc.INTERNAL_SERVER_ERROR).send(ut.fail(sc.INTERNAL_SERVER_ERROR,rm.INTERNAL_SERVER_ERROR));
        }
    }
}
