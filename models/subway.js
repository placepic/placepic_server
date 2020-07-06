const pool = require('../modules/pool');
const subwayTable = 'SUBWAY_TB';
/*
지하철 데이터 입력받을때: 호선과 역명으로 검색!
특정 지하철 데이터 조회할때: 역명으로 검색해서 해당 데이터 모두 추출!
*/ 

const subway = {
    getSubway: async () => {
        try {
            const query = `SELECT * FROM ${subwayTable}`;
            const subwayDto = await pool.queryParam(query);
            return subwayDto;
        }catch(err){
            console.log('subway error : ',err);
            throw err;
        }
    },
    isMatchedStation : async ({subwayName, subwayLine}) =>{
        try{
            const query = `SELECT * FROM ${subwayTable} WHERE  subwayName = "${subwayName}" and subwayLine = "${subwayLine}"`;
            const subwayDto = await pool.queryParam(query);
            return subwayDto;
        }catch(err){
            console.log('isMatchedStation error : ', err);
            throw err;
        }
    }
}

module.exports = subway;