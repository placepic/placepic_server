const pool = require('../modules/pool');

const admin = {


    getMywaitUserList : async(groupIdx) => {

        const getMywaitUserList = `SELECT * FROM (SELECT * FROM GROUP_USER_RELATION_TB WHERE groupIdx = ${groupIdx} and state = 2) AS MYGROUPWAITUSER natural join USER_TB `;

        try{    
            const result = await pool.queryParam(getMywaitUserList);
            return result;
    
        }catch(err) {
            console.log('signup ERROR : ', err);
            throw err;
        }
    },

    editStatusApplyUser : async(userIdx,groupIdx) => {
        const editStatusApplyUser = `UPDATE ${table} SET state = 1 WHERE userIdx = ${userIdx} and groupIdx = ${groupIdx}`;

        try{
            const result = await pool.queryParam(editStatusApplyUser);
            return result;
    
        }catch(err) {
            console.log('signup ERROR : ', err);
            throw err;
        }
    },

    deleteStatusApplyUser : async(userIdx,groupIdx) => {
        const deleteStatusApplyUser = `delete FROM ${table} WHERE userIdx = ${userIdx} and groupIdx = ${groupIdx}`;

        try{
            const result = await pool.queryParam(deleteStatusApplyUser);
            return result;
    
        }catch(err) {
            console.log('signup ERROR : ', err);
            throw err;
        }
    },
}


module.exports = admin;
