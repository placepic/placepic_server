/* 동관이가 작업하고있는 group과 컨플릭트 날거같아서 
따로 파서 작업하고있으 머지하면 이거 지울게요!*/ 
const pool = require('../modules/pool');
const groupTable = 'GROUP_TB';
const userGroupTable = 'GROUP_USER_RELATION_TB';
const STATE_PENDING = 2;

const placeGroup = {
    validUserGroup : async(userIdx,groupIdx) =>{
        const query = `SELECT * FROM ${userGroupTable} WHERE userIdx = "${userIdx}" and groupIdx = "${groupIdx}" and state NOT IN ("${STATE_PENDING}")`;
        try{
            const isValidUserGroup = await pool.queryParam(query);
            return isValidUserGroup;
        }catch(e){
            console.log('validUserGroup ERROR'+ e);
            throw e;
        }
    }
}

module.exports = placeGroup;