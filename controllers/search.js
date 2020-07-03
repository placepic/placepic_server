const ut = require('../modules/util');
const rm = require('../modules/responseMessage');
const sc = require('../modules/statusCode');
const api = require('../modules/api');
/*
groupIdx에 있는  place 모두 가져오기

query로 넘어온 데이터 가져오기

*/
module.exports = {
    apiSearch: async (req, res) => {
        try {
            const searchName = req.query;
            const apiResult = await api.mapFindAPI(searchName);
            
            return await res.status(sc.OK).send(ut.success(sc.OK,rm.SEARCH_API,apiResult)); // 데이터 0개일때도 생각해야함
        }catch(err){
            console.log(err);
            return await res.status(sc.INTERNAL_SERVER_ERROR).send(ut.fail(sc.INTERNAL_SERVER_ERROR,rm.INTERNAL_SERVER_ERROR));
        }
    }
}