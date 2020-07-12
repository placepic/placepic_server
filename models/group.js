const pool = require('../modules/pool');
const table = 'GROUP_USER_RELATION_TB';
const groupTable = 'GROUP_TB';
const STATE_PENDING = 2;
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
        const query = `INSERT INTO GROUP_USER_RELATION_TB (groupIdx,userIdx,part,phoneNumber) VALUES()`;
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

    //
    checkGroupIdx : async(id) => {
        const checkGroupIdx  = `SELECT * FROM GROUP_TB WHERE groupIdx = ${id}`;
        try{
            const result = await pool.queryParam(checkGroupIdx);
           

            return result.length;
        }catch(err) {
            console.log('signup ERROR : ', err);
            throw err;
        }
    },

    //그룹 정보(이름과 사진) 불러오기
    callMygroupInfo : async(groupIdx) => {
        const getMygroupInfo = `SELECT groupName , groupImage FROM GROUP_TB WHERE groupIdx = ${groupIdx}`;
    
        //const getMygroupInfo2 = `SELECT GROUP_TB.groupName, GROUP_TB.groupImage FROM GROUP_TB , GROUP_USER_RELATION_TB  WHERE GROUP_USER_RELATION_TB.userIdx = ${userIdx} and GROUP_TB.groupIdx =  GROUP_USER_RELATION_TB.groupIdx `;

    
        try{
            const result = await pool.queryParam(getMygroupInfo);
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

    getMyGroupList : async(userIdx,queryObject) => { // 쿼리로 비슷한 기능들을 한 기능에 모을 수 있다.
        let getMygroup = `SELECT * FROM (SELECT * FROM GROUP_USER_RELATION_TB WHERE userIdx = ${userIdx}) AS MYRELATIONGROUP natural left outer join GROUP_TB `;

        let getNotIngroupList = `SELECT groupIdx, groupName, groupImage, memberCount, count(*) as placeCount FROM (SELECT * FROM
            (SELECT groupIdx, count(*) as memberCount FROM GROUP_USER_RELATION_TB WHERE groupIdx NOT IN
            (SELECT groupIdx FROM GROUP_USER_RELATION_TB WHERE userIdx= ${userIdx} ) Group by groupIdx) as GETGROUPINFO
            natural join GROUP_TB
            ) as GETPLACEINFO natural join PLACE_TB Group by groupIdx`;

        if(queryObject.filter === 'wait') 
            getMygroup += ` WHERE MYRELATIONGROUP.state = 2`;
    
        else if(queryObject.filter === 'apply')
            getMygroup = getNotIngroupList
        else  
            getMygroup +=  ` WHERE MYRELATIONGROUP.state NOT IN(2)` ;

        try{
            const result = await pool.queryParam(query);
            
            return result;
    
        }catch(err) {
            console.log('signup ERROR : ', err);
            throw err;
        }
    },

    getMyApplyGroupList: async (userIdx) => {
        const query = `SELECT * FROM (SELECT *, count(*) as userCount FROM placepic.GROUP_USER_RELATION_TB WHERE groupIdx NOT IN (SELECT groupIdx FROM placepic.GROUP_USER_RELATION_TB WHERE userIdx=${userIdx} ) Group by groupIdx) as T natural join GROUP_TB;`
        try {
            const groupResult = await pool.queryParam(query);
            const groupIdxs = groupResult.map(group => group.groupIdx);
            const placeResult = await pool.queryParam(`SELECT *, count(*) as postCount FROM PLACE_TB WHERE groupIdx IN (${groupIdxs.length === 1 ? groupIdxs.join('') : groupIdxs.join(', ')}) GROUP BY groupIdx`);
            const resultMap = new Map();
            groupResult.forEach((group) => {
                resultMap.set(group.groupIdx, {
                    groupIdx: group.groupIdx,
                    groupUserIdx: group.groupUserIdx,
                    state: group.state,
                    part: group.part,
                    phoneNumber: group.phoneNumber,
                    groupName: group.groupName,
                    groupImage: group.groupImage,
                    userCount: group.userCount,
                    postCount: 0,
                });
            });
            placeResult.forEach(place => resultMap.get(place.groupIdx).placeCount = place.placeCount);;
            console.log(resultMap);
            return [...resultMap.values()];
        } catch(e) {
            throw e;
        }
    },


    getMyWaitGroupList : async(userIdx) => {
        const getMygroup = `SELECT * FROM (SELECT * FROM GROUP_USER_RELATION_TB WHERE userIdx = ${userIdx}) AS MYRELATIONGROUP natural left outer join GROUP_TB WHERE MYRELATIONGROUP.state = 2 `;
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
        
    },

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

    validUserGroup : async(userIdx,groupIdx) =>{
        const query = `SELECT * FROM ${table} WHERE userIdx = "${userIdx}" and groupIdx = "${groupIdx}" and state NOT IN ("${STATE_PENDING}")`;
        try{
            const isValidUserGroup = await pool.queryParam(query);
            return isValidUserGroup;
        }catch(e){
            console.log('validUserGroup ERROR'+ e);
            throw e;
        }
    },

    checkAlreadyGroup : async(userIdx,groupIdx) =>{
        const query = `SELECT groupIdx FROM ${table} WHERE userIdx = ${userIdx} and groupIdx = ${groupIdx} `;
        try{
            const result = await pool.queryParam(query);
            console.log('bbbbb',result[0]);
            return result.length === 0; /// 이렇게 주면 결과값이 true,false로 나온다.
        }catch(e) {
            throw e;
        }
        }
    }
module.exports = group;





