const pool = require('../modules/pool');
const table = 'GROUP_USER_RELATION_TB';
const admin = {
    getMywaitUserList : async(groupIdx) => {
        const getMywaitUserList = `SELECT userIdx,userName,part,userBirth,phoneNumber,gender,groupIdx FROM (SELECT * FROM GROUP_USER_RELATION_TB WHERE groupIdx = ${groupIdx} and state = 2) AS MYGROUPWAITUSER natural join USER_TB `;
        try{    
            const result = await pool.queryParam(getMywaitUserList);
            return result;
    
        }catch(err) {
            console.log('getMywaitUserList ERROR : ', err);
            throw err;
        }
    },
    getMyInfo : async(userIdx,groupIdx) => { //이름,소속,이미지,상태,유저 총 글 수
        const getMyInfo = `SELECT * FROM (SELECT * FROM GROUP_USER_RELATION_TB WHERE groupIdx = ${groupIdx} and userIdx = ${userIdx}) AS MYGROUPWAITUSER natural join USER_TB `;

        try{    
            const result = await pool.queryParam(getMyInfo);
            return result;
        }catch(err) {
            console.log('getMyInfo ERROR : ', err);
            throw err;
        }
    },
    deleteStatusApplyUser : async(userIdx,groupIdx) => {
        const deleteStatusApplyUser = `delete FROM ${table} WHERE userIdx = ${userIdx} and groupIdx = ${groupIdx}`;

        try{
            const result = await pool.queryParam(deleteStatusApplyUser);
            return result;
    
        }catch(err) {
            console.log('deleteStatusApplyUser ERROR : ', err);
            throw err;
        }
    }
}

module.exports = admin;
