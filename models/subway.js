const pool = require('../modules/pool');
const subwayTable = 'SUBWAY_TB';
const table = require('../modules/table');
const subwaySorting =require('../modules/stationSort');
const subwayLineTB = "SUBWAY_LINE_TB";
/*
지하철 데이터 입력받을때: 호선과 역명으로 검색!
특정 지하철 데이터 조회할때: 역명으로 검색해서 해당 데이터 모두 추출!
*/ 

const subway = {
    isMatchedStation : async (subwayIdx) =>{
        try{
            const query = `SELECT * FROM ${subwayTable} WHERE  subwayIdx = "${subwayIdx}"`;
            const subwayDto = await pool.queryParam(query);
            return subwayDto[0];
        }catch(err){
            console.log('isMatchedStation error : ', err);
            throw err;
        }
    },
    getSubway : async () =>{
        try{
            const subwayDto = table.getSubwayJoinLine();
            return subwayDto;
        }catch(err){
            console.log('subway error :', err);
            throw err;
        }
    },
    insertLine : async() =>{
        try{
            const subwayDto = table.getSubway();
            let sortedDto = subwaySorting.stationSort(subwayDto);
            const addSubwayLine = `INSERT INTO ${subwayLineTB} (subwayLine, subwayIdx) VALUES (?,?)`;
            for(let i = 0; i <sortedDto.length; i++){
                console.log("subwayIdx:", sortedDto[i].subwayIdx)
                console.log("subway Name :", sortedDto[i].subwayName);
                for(let it of sortedDto[i].subwayLine){
                    console.log('it:', it)
                    await pool.queryParamArr(addSubwayLine,[it,sortedDto[i].subwayIdx])
                }
            }
            return sortedDto;
        }catch(err){
            console.log('subway error :', err);
            throw err;
        } 
    }
}

module.exports = subway;