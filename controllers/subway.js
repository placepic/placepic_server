const subway = require('../models/subway');
const ut = require('../modules/util');
const rm = require('../modules/responseMessage');
const sc = require('../modules/statusCode');
const sortingSubway = require('../modules/stationSort');

module.exports = {
    readStation : async (req,res)=>{
        try{
            const stationData = await subway.getSubway();
            const data = sortingSubway.stationSort(stationData);
            return await res.status(sc.OK).send(ut.success(sc.OK,rm.READ_SUBWAY,data));
        }catch(err){
            console.log(err);
            return await res.status(sc.INTERNAL_SERVER_ERROR).send(ut.fail(sc.INTERNAL_SERVER_ERROR,rm.INTERNAL_SERVER_ERROR));
        }
    },
    insertLineTable : async(req,res)=>{
        try{
            const result = await subway.insertLine();
            return await res.status(sc.OK).send(ut.success(sc.OK, rm.READ_SUBWAY,result));
        }catch(err){
            console.log(err);
            return await res.status(sc.INTERNAL_SERVER_ERROR).send(ut.fail(sc.INTERNAL_SERVER_ERROR,rm.INTERNAL_SERVER_ERROR));
        }
    }
}