const pool = require('../modules/pool');
const table = 'GROUP_USER_RELATION_TB';
const groupTable = 'GROUP_TB';
const STATE_PENDING = 2;
const _ = require('lodash');
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
        const query = `INSERT INTO GROUP_USER_RELATION_TB (${fields}) VALUES(${questions})`;
        //`INSERT INTO ${subwayLineTB} (subwayLine, subwayIdx) VALUES (?,?)`;
        try {
            const result = await pool.queryParamArr(query, values); 
            const insertId = result.insertId;
            return insertId;
        } catch (err) {
            console.log('apply ERROR : ', err);
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
            console.log('callMyGroupStatus ERROR : ', err);
            throw err;
        }
    },

    checkGroupIdx : async(id) => {
        const checkGroupIdx  = `SELECT * FROM GROUP_TB WHERE groupIdx = ${id}`;
        try{
            const result = await pool.queryParam(checkGroupIdx);
            return result.length;
        }catch(err) {
            console.log('checkGroupIdx ERROR : ', err);
            throw err;
        }
    },

    //그룹 정보(이름과 사진) 불러오기
    callMygroupInfo : async(groupIdx) => {
        const getMygroupInfo = `SELECT groupName , groupImage FROM GROUP_TB WHERE groupIdx = ${groupIdx}`;
        try{
            const result = await pool.queryParam(getMygroupInfo);
            return result;
        }catch(err) {
            console.log('callMygroupInfo ERROR : ', err);
            throw err;
        }
    },

    // 그룹 총 유저 수 체크
    callMygroupUserCnt : async(userIdx) => {

        const getMygroupUserCnt = `SELECT * FROM GROUP_USER_RELATION_TB WHERE userIdx = ${userIdx} and state not  in(2) ` ;
 
        try{
            const result = await pool.queryParam(getMygroupUserCnt);
            return result;
        }catch(err) {
            console.log('callMygroupUserCnt ERROR : ', err);
            throw err;
        }    
    },
    // 그룹 게시물 등록갯수 체크
    callMygroupPostCnt : async(userIdx) => {
        const getMygroupInfo2 = `SELECT COUNT(*) postCnt FROM  GROUP_USER_RELATION_TB, PLACE_TB  WHERE GROUP_USER_RELATION_TB.userIdx = ${userIdx} GROUP BY GROUP_USER_RELATION_TB.groupIdx`
        try{
            const result = await pool.queryParam(getMygroupInfo2);
            return result;
        }catch(err) {
            console.log('callMygroupPostCnt ERROR : ', err);
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
            console.log('callStatusWait ERROR : ', err);
            throw err;
        }
    },

    getMyGroupList : async(userIdx,queryObject) => { // 쿼리로 비슷한 기능들을 한 기능에 모을 수 있다.
        let getMygroup = `SELECT * FROM (SELECT * FROM GROUP_USER_RELATION_TB WHERE userIdx = ${userIdx}) AS MYRELATIONGROUP natural left outer join GROUP_TB `;
        if(queryObject.filter === 'wait') 
            getMygroup += `WHERE MYRELATIONGROUP.state = 2`;
        else  
            getMygroup +=  `WHERE MYRELATIONGROUP.state NOT IN(2)` ;
        try{
            const result = await pool.queryParam(getMygroup);
            return result;
        }catch(err) {
            console.log('그룹들을 불러오지 못했습니다 getMyGroupList err. : ', err);
            throw err;
        }
    },

    getMyApplyGroupList: async (userIdx) => {
        const query = `SELECT * FROM (SELECT *, count(*) as userCount FROM placepic.GROUP_USER_RELATION_TB WHERE groupIdx NOT IN (SELECT groupIdx FROM placepic.GROUP_USER_RELATION_TB WHERE userIdx=${userIdx} ) Group by groupIdx) as T natural join GROUP_TB;`
        try {
            const groupResult = await pool.queryParam(query);
            if(_.isNil(groupResult)){
                console.log("불러올 지원가능한 그룹이 없습니다.");
                return groupResult; //groupResult 가 [] 일때.
            }
            const groupIdxs = groupResult.map(group => group.groupIdx);
            const placeResult = await pool.queryParam(`SELECT *, count(*) as postCount FROM PLACE_TB WHERE groupIdx IN (${groupIdxs.length === 1 ? groupIdxs.join('') : groupIdxs.join(', ')}) GROUP BY groupIdx`);
            const resultMap = new Map();
            groupResult.forEach((group) => {
                resultMap.set(group.groupIdx, {
                    groupIdx: group.groupIdx,
                    groupUserIdx: group.groupUserIdx,
                    userIdx: group.userIdx,
                    state: group.state, 
                    part: group.part,
                    phoneNumber: group.phoneNumber,
                    groupName: group.groupName,
                    groupImage: group.groupImage,
                    userCount: group.userCount,
                    postCount: 0,
                });
            });
            placeResult.forEach(place => resultMap.get(place.groupIdx).postCount = place.postCount);
            return [...resultMap.values()];
        } catch(e) {
            console.log('getMyApplyGroupList error(지원가능한 그룹목록을 불러오지 못했습니다.) :',err);
            throw e;
        }
    },


    getMyWaitGroupList : async(userIdx) => {
        const getMygroup = `SELECT * FROM (SELECT * FROM GROUP_USER_RELATION_TB WHERE userIdx = ${userIdx}) AS MYRELATIONGROUP natural left outer join GROUP_TB WHERE MYRELATIONGROUP.state = 2 `;
        try{
            const result = await pool.queryParam(getMygroup);
            return result;
    
        }catch(err) {
            console.log('getMyWaitGroupList ERROR : ', err);
            throw err;
        }
    },


    getGroupUserCnt : async(groupIdx) => {
        const getGroupUserCnt = `SELECT count(*) as userCount FROM GROUP_USER_RELATION_TB WHERE groupIdx = ${groupIdx} and state NOT IN(2)`;

        try{
            const result = await pool.queryParam(getGroupUserCnt);
            return result[0].userCount;
    
        }catch(err) {
            console.log('getGroupUserCnt ERROR : ', err);
            throw err;
        }
    },
    
    getGroupPostCnt : async(groupIdx) => {
        const getGroupPostCnt = `SELECT count(*) as postCount FROM PLACE_TB WHERE groupIdx = ${groupIdx}`;
        try{
            const result = await pool.queryParam(getGroupPostCnt);
            return result[0].postCount;
    
        }catch(err) {
            console.log('getGroupPostCnt ERROR : ', err);
            throw err;
        }
        
    },

    getMywaitUserList : async(groupIdx) => {

        const getMywaitUserList = `SELECT * FROM (SELECT * FROM GROUP_USER_RELATION_TB WHERE groupIdx = ${groupIdx} and state = 2) AS MYGROUPWAITUSER natural join USER_TB `;

        try{    
            const result = await pool.queryParam(getMywaitUserList);
            return result;
    
        }catch(err) {
            console.log('getMywaitUserList ERROR : ', err);
            throw err;
        }
    },

    editStatusApplyUser : async(userIdx,groupIdx) => {
        const editStatusApplyUser = `UPDATE ${table} SET state = 1 WHERE userIdx = ${userIdx} and groupIdx = ${groupIdx}`;

        try{
            const result = await pool.queryParam(editStatusApplyUser);
            return result;
    
        }catch(err) {
            console.log('editStatusApplyUser ERROR : ', err);
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
            return result.length === 0; /// 이렇게 주면 결과값이 true,false로 나온다.
        }catch(e) {
            throw e;
        }
        },


    // getMyGroupRanking: async (groupIdx) => {
    //     const query = `SELECT * FROM (SELECT * FROM placepic.GROUP_USER_RELATION_TB WHERE groupIdx = ${groupIdx} and state NOT IN (2)) AS MYGROUPWAITUSER natural join placepic.USER_TB ;`
    //         try {
    //             const groupResult = await pool.queryParam(query);
    //             if(_.isNil(groupResult)){
    //                 return groupResult; //groupResult 가 [] 일때.
    //             }
    //             const userIdxs = groupResult.map(group => group.userIdx); // => 뒤에 있는게 조건
    //             const placeResult = await pool.queryParam(`SELECT *, count(*) as postCount FROM PLACE_TB WHERE groupIdx = ${groupIdx} and userIdx IN (${userIdxs.join(', ')}) GROUP BY userIdx`);
    //             const resultMap = new Map();
    //             groupResult.forEach((group) => {
    //                 resultMap.set(group.userIdx, { //key = group.userIdx, value = 객체
    //                     groupIdx: group.groupIdx,
    //                     userIdx: group.userIdx,
    //                     userName: group.userName,
    //                     profileImageUrl : group.profileImageUrl,
    //                     state: group.state, 
    //                     part: group.part,
    //                     postCount: 0,
    //                 });
    //             });

    //             placeResult.forEach(place => resultMap.get(place.userIdx).postCount = place.postCount);
    //             return [...resultMap.values()].sort((a, b) => {
    //                 if(b.postCount !== a.postCount)  return  b.postCount - a.postCount;
    //                 else  return a.userName < b.userName? -1 : a.userName > b.userName ? 1 : 0;
    //             })
                
    
    //         } catch(e) {
    //             console.log('getMyGroupRanking error :',e);
    //             throw e;
    //         }
    //     },

    // 페이지네이션 
    // getMyGroupRanking: async (page,groupIdx) => {

    //     const limit = 3;
    //     const offset = (page-1) * limit;
    //     const query = `SELECT userIdx, userName,profileImageUrl,count(placeName) as postCount FROM
    //     (SELECT * FROM 
    //     (SELECT * FROM GROUP_USER_RELATION_TB WHERE groupIdx = 1 and state not in (2))
    //      AS MYGROUPWAITUSER natural join USER_TB)
    //      AS POSTCOUNT natural left join PLACE_TB group by userIdx order by postCount DESC,userName limit ${limit} offset ${offset}`;
    //         try {
    //             const groupResult = await pool.queryParam(query);
    //             if(_.isNil(groupResult)){
    //                 return groupResult; //groupResult 가 [] 일때.
    //             }

    //             console.log(groupResult)

            
    //             return groupResult.sort((a, b) => {
    //                 if(b.postCount === a.postCount)  return a.userName < b.userName? -1 : a.userName > b.userName ? 1 : 0;
    //             })
                
    
    //         } catch(e) {
    //             console.log('get my apply group list error :',e);
    //             throw e;
    //         }
    //     },
    //     }


    getMyGroupRanking: async (page,groupIdx) => {

        const query = `SELECT userIdx, userName,part,profileImageUrl,count(placeName) as postCount FROM
        (SELECT * FROM 
        (SELECT * FROM GROUP_USER_RELATION_TB WHERE groupIdx = ${groupIdx} and state not in (2))
        AS MYGROUPWAITUSER natural join USER_TB)
        AS POSTCOUNT natural left join PLACE_TB group by userIdx order by postCount DESC,userName`;
            try {
                const groupResult = await pool.queryParam(query);
                if(_.isNil(groupResult)){
                    return groupResult; //groupResult 가 [] 일때.
                }   
                const resultMap = new Map();
                groupResult.forEach((group) => {
                    resultMap.set(group.userIdx, {
                        userName: group.userName,
                        profileImageUrl : group.profileImageUrl,
                        part: group.part,
                        postCount: group.postCount,
                        rank: 0
                    });
                    });
                

                // groupResult.forEach(group => { 
                //     let rank = 0;    
                //     if(groupResult.postCount === )
                //     resultMap.get(group.userIdx).postCount = group.postCount}); 

                let rank = 0;
                for(let i =0; i < groupResult.length; i++) {
                    
                    //console.log(groupResult[i].postCount)
                    if(i === groupResult.length - 1){
                    [...resultMap.values()][i].rank = rank;
                        break;
                    } 
                    else if(groupResult[i].postCount === groupResult[i+1].postCount){
                    // 전인덱스가 3 다음인덱스가 2  그리고 전인덱스가 2 다음인덱스가 2
                    if(groupResult[i-1].postCount > groupResult[i].postCount){
                        rank = rank + 1;
                        [...resultMap.values()][i].rank = rank;
                    }
                    else
                        [...resultMap.values()][i].rank = rank;

                    }
                       //placeResult.forEach(place => resultMap.get(place.userIdx).postCount = place.postCount);
                    else{
                    rank = rank + 1;
                    [...resultMap.values()][i].rank = rank;
                }
                }
                    
            console.log([...resultMap.values()][0]);

            return [...resultMap.values()];
            
    
            } catch(e) {
                console.log('get my apply group list error :',e);
                throw e;
            }
        },
        }
    
module.exports = group;





