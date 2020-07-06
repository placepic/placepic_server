const pool = require('../modules/pool');
const table = 'GROUP_USER_RELATION_TB';

const countStatusWaitNum = `SELECT COUNT(*) as countUser FROM GROUP_USER_RELATION_TB WHERE groupIdx = 1 and status = 2`;
const countGroupUserNum = `SELECT COUNT(*) as countUser FROM GROUP_USER_RELATION_TB WHERE groupIdx = 1 and status NOT IN(2)`;
const countPlace = `SELECT COUNT(*) as countPlace FROM PLACE_TB WHERE groupIdx = 1`;
//const getGroupInfo = `SELECT groupName , groupImage FROM GROUP_TB WHERE groupIdx = 1`;


const group = {

    // 그룹 신청하기
    apply: async (groupIdx,userIdx,part,phoneNumber) => {
        const fields = 'groupIdx,userIdx,part,phoneNumber';
        const questions = `?, ?, ?, ?`;
        const values = [groupIdx,userIdx,part,phoneNumber];
        const query = `INSERT INTO ${table}(${fields}) VALUES(${questions})`;
        try {
            const result = await pool.queryParamArr(query, values);
            const insertId = result.insertId;
            return insertId;
        } catch (err) {
            console.log('signup ERROR : ', err);
            throw err;
        }
    },

    //유저 그룹 상태 가져오기

    callMyGroupStatus : async(userIdx) => {
        const getMygroupStatus = `SELECT state FROM GROUP_USER_RELATION_TB WHERE userIdx = ${userIdx}`;
        try{
            const result = await pool.queryParam(getMygroupStatus);
            return result;
        }catch(err) {
            console.log('signup ERROR : ', err);
            throw err;
        }
    },

    //유저 그룹인덱스 불러오기
    callMyGroupIdx : async(id) => {
        const getMygroupIdx = `SELECT groupIdx FROM GROUP_USER_RELATION_TB WHERE userIdx = ${id}`;
        try{
            const result = await pool.queryParam(getMygroupIdx);
           

            return result;
        }catch(err) {
            console.log('signup ERROR : ', err);
            throw err;
        }
    },

    // 내 그룹 정보(이름과 사진) 불러오기
    callMygroupInfo : async(userIdx) => {
        //const getMygroupInfo = `SELECT groupName , groupImage FROM GROUP_TB WHERE groupIdx = ${groupIdx}`;
       
         const getMygroupInfo2 = `SELECT GROUP_TB.groupName, GROUP_TB.groupImage FROM GROUP_TB , GROUP_USER_RELATION_TB  WHERE GROUP_USER_RELATION_TB.userIdx = ${userIdx} and GROUP_TB.groupIdx =  GROUP_USER_RELATION_TB.groupIdx `;

       
        try{
            const result = await pool.queryParam(getMygroupInfo2);
            return result;
        }catch(err) {
            console.log('signup ERROR : ', err);
            throw err;
        }
    },
    // 그룹 총 유저 수 체크
    callMygroupUserCnt : async(userIdx) => {
        // const getMygroupUserCnt = `SELECT COUNT(*) as countUser FROM GROUP_USER_RELATION_TB WHERE userIdx = ${userIdx} and state NOT IN(2)`;    

        const getMygroupUserCnt = `SELECT * FROM GROUP_USER_RELATION_TB WHERE userIdx = ${userIdx} and state not  in(2) ` ;
        // const getMygroupUserCnt = `SELECT COUNT`
        
        
        try{
            const result = await pool.queryParam(getMygroupUserCnt);
            return result;
        }catch(err) {
            console.log('signup ERROR : ', err);
            throw err;
        }    
    },
    // 그룹 게시물 등록갯수 체크
    callMygroupPostCnt : async(userIdx) => {
       // const getMygroupPostCnt =  `SELECT COUNT(*) as countPlace FROM PLACE_TB WHERE groupIdx = ${id}`;

        const getMygroupInfo2 = `SELECT COUNT(*) postCnt FROM  GROUP_USER_RELATION_TB, PLACE_TB  WHERE GROUP_USER_RELATION_TB.userIdx = ${userIdx} GROUP BY GROUP_USER_RELATION_TB.groupIdx`
        try{
            const result = await pool.queryParam(getMygroupInfo2);
            return result;
        }catch(err) {
            console.log('signup ERROR : ', err);
            throw err;
        }   
    },
     // 그룹대기 인원 수 체크
    callStatusWait :  async(id) => {
        const countStatusWaitNum = `SELECT COUNT(*) as countUser FROM GROUP_USER_RELATION_TB WHERE userIdx = ${id} and state = 2`;
        try{
            const result = await pool.queryParam(countStatusWaitNum);
            return result;
    
        }catch(err) {
            console.log('signup ERROR : ', err);
            throw err;
        }
    },

    getMyGroupList : async(userIdx) => {
        const getMygroup = `SELECT * FROM (SELECT * FROM GROUP_USER_RELATION_TB WHERE userIdx = ${userIdx}) AS MYRELATIONGROUP natural left outer join GROUP_TB `
        try{
            const result = await pool.queryParam(getMygroup);
            return result;
    
        }catch(err) {
            console.log('signup ERROR : ', err);
            throw err;
        }
    },


    getGroupUserCnt : async(groupIdx) => {
        const getGroupUserCnt = `SELECT count(*) as userCount FROM GROUP_USER_RELATION_TB WHERE groupIdx = ${groupIdx} and state NOT IN(2)`;

        try{
            const result = await pool.queryParam(getGroupUserCnt);
            return result[0].userCount;
    
        }catch(err) {
            console.log('signup ERROR : ', err);
            throw err;
        }
    },
    
    getGroupPostCnt : async(groupIdx) => {
        const getGroupPostCnt = `SELECT count(*) as postCount FROM PLACE_TB WHERE groupIdx = ${groupIdx}`;

        try{
            const result = await pool.queryParam(getGroupPostCnt);
            return result[0].postCount;
    
        }catch(err) {
            console.log('signup ERROR : ', err);
            throw err;
        }

    }



}
module.exports = group;





