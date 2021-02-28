const pool = require('../modules/pool');
const table = 'GROUP_USER_RELATION_TB';
const groupTable = 'GROUP_TB';
const STATE_PENDING = 2;
const _ = require('lodash');

const group = {    
    apply : async({userName,userIdx,groupIdx,part}) => {
        const editName = `UPDATE USER_TB SET userName = '${userName}' WHERE userIdx = ?`;
        const insertPart = `INSERT INTO GROUP_USER_RELATION_TB(groupIdx,userIdx,part,state) VALUES(?,?,?,?)`;
        try{
            await pool.Transaction( async (conn) =>{
                let editNameResult = await conn.query(editName,userIdx)
                let addPartResult = await conn.query(insertPart,[groupIdx,userIdx,part,1]);
            
            }).catch((err)=>{
                console.log('그룹유저 추가 트랜잭션 오류! :',err)
                throw err;
            })
        }catch(e){
            console.log("그룹유저 추가 에러 :", e);
            throw(e);
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
    callMyGroupStatus: async (userIdx) => {
        const getMygroupStatus = `SELECT state FROM GROUP_USER_RELATION_TB WHERE userIdx = ${userIdx}`;
        try {
            const result = await pool.queryParam(getMygroupStatus);
            return result;
        } catch (err) {
            console.log('callMyGroupStatus ERROR : ', err);
            throw err;
        }
    },
    checkGroupIdx: async (id) => {
        const checkGroupIdx = `SELECT * FROM GROUP_TB WHERE groupIdx = ${id}`;
        try {
            const result = await pool.queryParam(checkGroupIdx);
            return result.length;
        } catch (err) {
            console.log('checkGroupIdx ERROR : ', err);
            throw err;
        }
    },
    callMygroupInfo: async (groupIdx) => {
        const getMygroupInfo = `SELECT groupName , groupImage FROM GROUP_TB WHERE groupIdx = ${groupIdx}`;
        try {
            const result = await pool.queryParam(getMygroupInfo);
            return result;
        } catch (err) {
            console.log('callMygroupInfo ERROR : ', err);
            throw err;
        }
    },
    callMygroupUserCnt: async (userIdx) => {
        const getMygroupUserCnt = `SELECT * FROM GROUP_USER_RELATION_TB WHERE userIdx = ${userIdx} and state not  in(2) `;
        try {
            const result = await pool.queryParam(getMygroupUserCnt);
            return result;
        } catch (err) {
            console.log('callMygroupUserCnt ERROR : ', err);
            throw err;
        }
    },
    callMygroupPostCnt: async (userIdx) => {
        const getMygroupInfo2 = `SELECT COUNT(*) postCnt FROM  GROUP_USER_RELATION_TB, PLACE_TB  WHERE GROUP_USER_RELATION_TB.userIdx = ${userIdx} GROUP BY GROUP_USER_RELATION_TB.groupIdx`
        try {
            const result = await pool.queryParam(getMygroupInfo2);
            return result;
        } catch (err) {
            console.log('callMygroupPostCnt ERROR : ', err);
            throw err;
        }
    },
    callStatusWait: async (id) => {
        const countStatusWaitNum = `SELECT COUNT(*) as countUser FROM GROUP_USER_RELATION_TB WHERE userIdx = ${id} and state = 2`;
        try {
            const result = await pool.queryParam(countStatusWaitNum);
            return result;
        } catch (err) {
            console.log('callStatusWait ERROR : ', err);
            throw err;
        }
    },

    getMyGroupList: async (userIdx) => {
        const getGroupbyUser = `SELECT groupIdx, groupName, groupImage, groupCode , count(userIdx) as userCnt FROM GROUP_TB natural left outer join GROUP_USER_RELATION_TB group by groupIdx;`;
        try {
            const getGroupResult = await pool.queryParam(getGroupbyUser);
            if (getGroupResult.length === 0) {
                console.log("불러올 지원가능한 그룹이 없습니다.");
                return getGroupResult; //groupResult 가 [] 일때.
            }
            const groupIdxs = getGroupResult.map(group => group.groupIdx);
            const placeResult = await pool.queryParam(`SELECT *, count(*) as postCount FROM PLACE_TB WHERE groupIdx IN (${groupIdxs.length === 1 ? groupIdxs.join('') : groupIdxs.join(', ')}) GROUP BY groupIdx`);
            const getState = await pool.queryParam(`SELECT * FROM placepic.GROUP_USER_RELATION_TB where userIdx = ${userIdx} group by groupIdx;`);

            const resultMap = new Map();
            getGroupResult.forEach((group) => {
                resultMap.set(group.groupIdx, {
                    groupIdx: group.groupIdx,
                    state: -1,
                    groupName: group.groupName,
                    groupImage: group.groupImage,
                    userCount: group.userCnt,
                    groupCode: group.groupCode,
                    postCount: 0,
                });
            });
            placeResult.forEach(place => {
                resultMap.get(place.groupIdx).postCount = place.postCount
            });
            getState.forEach(ele => {
                resultMap.get(ele.groupIdx).state = ele.state // 만약 getState가 없으면 이 로직을 실행하면 안댐
            })
            
            return [...resultMap.values()];
        } catch (e) {
            console.log('getMygroupList error(그룹목록을 불러오지 못했습니다.) :', e);
            throw e;
        }
    },
    getMyWaitGroupList: async (userIdx) => {
        const getMygroup = `SELECT * FROM (SELECT * FROM GROUP_USER_RELATION_TB WHERE userIdx = ${userIdx}) AS MYRELATIONGROUP natural left outer join GROUP_TB WHERE MYRELATIONGROUP.state = 2 `;
        try {
            const result = await pool.queryParam(getMygroup);
            return result;

        } catch (err) {
            console.log('getMyWaitGroupList ERROR : ', err);
            throw err;
        }
    },
    getGroupUserCnt: async (groupIdx) => {
        const getGroupUserCnt = `SELECT count(*) as userCount FROM GROUP_USER_RELATION_TB WHERE groupIdx = ${groupIdx} and state NOT IN(2)`;

        try {
            const result = await pool.queryParam(getGroupUserCnt);
            return result[0].userCount;

        } catch (err) {
            console.log('getGroupUserCnt ERROR : ', err);
            throw err;
        }
    },

    getGroupPostCnt: async (groupIdx) => {
        const getGroupPostCnt = `SELECT count(*) as postCount FROM PLACE_TB WHERE groupIdx = ${groupId}`;
        try {
            const result = await pool.queryParam(getGroupPostCnt);
            return result[0].postCount;

        } catch (err) {
            console.log('getGroupPostCnt ERROR : ', err);
            throw err;
        }

    },
    getMywaitUserList: async (groupIdx) => {

        const getMywaitUserList = `SELECT * FROM (SELECT * FROM GROUP_USER_RELATION_TB WHERE groupIdx = ${groupIdx} and state = 2) AS MYGROUPWAITUSER natural join USER_TB `;

        try {
            const result = await pool.queryParam(getMywaitUserList);
            return result;

        } catch (err) {
            console.log('getMywaitUserList ERROR : ', err);
            throw err;
        }
    },
    editStatusApplyUser: async (userIdx, groupIdx) => {
        const editStatusApplyUser = `UPDATE ${table} SET state = 1 WHERE userIdx = ${userIdx} and groupIdx = ${groupIdx}`;

        try {
            const result = await pool.queryParam(editStatusApplyUser);
            return result;

        } catch (err) {
            console.log('editStatusApplyUser ERROR : ', err);
            throw err;
        }
    },
    deleteStatusApplyUser: async (userIdx, groupIdx) => {
        const deleteStatusApplyUser = `delete FROM ${table} WHERE userIdx = ${userIdx} and groupIdx = ${groupIdx}`;

        try {
            const result = await pool.queryParam(deleteStatusApplyUser);
            return result;

        } catch (err) {
            console.log('deleteStatusApplyUser ERROR : ', err);
            throw err;
        }
    },
    validUserGroup: async (userIdx, groupIdx) => {
        const query = `SELECT * FROM ${table} WHERE userIdx = "${userIdx}" and groupIdx = "${groupIdx}" and state NOT IN ("${STATE_PENDING}")`;
        try {
            const isValidUserGroup = await pool.queryParam(query);
            return isValidUserGroup;
        } catch (e) {
            console.log('validUserGroup ERROR' + e);
            throw e;
        }
    },
    checkAlreadyGroup: async (userIdx, groupIdx) => {
        const query = `SELECT groupIdx FROM ${table} WHERE userIdx = ${userIdx} and groupIdx = ${groupIdx} `;
        try {
            const result = await pool.queryParam(query);
            return result.length === 0; /// 이렇게 주면 결과값이 true,false로 나온다.
        } catch (e) {
            throw e;
        }
    },
    isGroup : async (groupIdx)=>{
        const query = `SELECT  * FROM GROUP_TB WHERE groupIdx = ${groupIdx}`;
        try{
            const result = await pool.queryParam(query);
            return result[0];
        }catch(e){
            console.log('그룹 존재여부 체크 :', e);
            throw e;
        }
    },

    getMyGroupRanking: async (groupIdx) => {
        const query = `SELECT userIdx, userName,part,profileImageUrl,count(placeName) as postCount FROM
        (SELECT * FROM 
        (SELECT * FROM GROUP_USER_RELATION_TB WHERE groupIdx = ${groupIdx})
        AS MYGROUPWAITUSER natural join USER_TB)
        AS POSTCOUNT natural left join PLACE_TB group by userIdx order by postCount DESC,userName`;
        try {
            const groupResult = await pool.queryParam(query);
            if (_.isNil(groupResult)) {
                return groupResult; //groupResult 가 [] 일때.
            }
            const resultMap = new Map();
            groupResult.forEach((group) => {
                resultMap.set(group.userIdx, {
                    userIdx: group.userIdx,
                    userName: group.userName,
                    profileImageUrl: group.profileImageUrl.replace("origin", "w_200"),
                    part: group.part,
                    postCount: group.postCount,
                    rank: 0
                });
            });

            let rank = 1;
            let stack = [];
            let cnt = 0;
            groupResult[0].rank = 1;
            [...resultMap.values()][0].rank = 1
            stack.push(groupResult[0].postCount);
            for(let i = 1; i< groupResult.length; i++){
                if((groupResult[i].postCount < stack[stack.length -1]) && groupResult[i].postCount !==0 ){
                    while((stack.length) > 0){
                        stack.pop()
                        cnt++;
                    }
                    rank = rank + cnt;
                    [...resultMap.values()][i].rank = rank;
                    cnt = 0;
                    stack.push(groupResult[i].postCount);
                }else if(groupResult[i].postCount === 0){
                    [...resultMap.values()][i].rank = -1;
                }else{
                    stack.push(groupResult[i].postCount);
                    [...resultMap.values()][i].rank =rank;
                }
            }
            return [...resultMap.values()];
        } catch (e) {
            console.log('get my apply group list error :', e);
            throw e;
        }
    },

   
    getProfileInfo: async (userIdx, groupIdx) => { 
            try {
                const getMyInfo = `SELECT * FROM (SELECT * FROM GROUP_USER_RELATION_TB WHERE groupIdx = ${groupIdx} and userIdx = ${userIdx} and state NOT IN (2)) AS MYGROUPWAITUSER natural join USER_TB `;
                const groupResult = await pool.queryParam(getMyInfo);
                const getPlacesWithUser =  `SELECT placeIdx,placeImageUrl,placeName FROM (SELECT placeIdx,placeImageUrl,placeName, groupIdx, userIdx FROM PLACE_TB as p natural left outer join PLACEIMAGE_TB as i where p.placeIdx = i.placeIdx)as a WHERE a.groupIdx = ${groupIdx} and userIdx = ${userIdx} group by placeIdx`
                const placeResult = await pool.queryParam(`SELECT *, count(*) as postCount FROM PLACE_TB WHERE groupIdx = ${groupIdx} and userIdx = ${userIdx} GROUP BY groupIdx`);
                    const getPlacesInfo = await pool.queryParam(getPlacesWithUser); // 작성한 이름,이미지,placeIdx
                    if (_.isNil(getPlacesInfo)) {
                        return getPlacesInfo; //groupResult 가 [] 일때.
                    }
        
                    const likeCountQuery = `SELECT COUNT(*) as likeCnt,placeIdx FROM LIKE_TB group by placeIdx`; 
                    const getSubwayName = `SELECT * FROM SUBWAY_PLACE_RELATION_TB as a natural left outer join SUBWAY_TB as b;`;
                    const getLikeCnt = await pool.queryParam(likeCountQuery); // 작성한 글 좋아요 갯수 목록
                    const getSubwayNames = await pool.queryParam(getSubwayName); // 작성한 글 지하철 목록
                    let result = new Map();
        
                    getPlacesInfo.forEach((it) => {
                        it.likeCnt = 0;
                        it.subwayName = [];
                    });
        
                    getPlacesInfo.forEach(ele => result.set(ele.placeIdx, {
                        placeIdx: ele.placeIdx,
                        placeName: ele.placeName,
                        placeImageUrl:  ele.placeImageUrl,
                        likeCnt: ele.likeCnt,
                        subwayName: ele.subwayName
                    }))
        
                    getLikeCnt.forEach(ele => {
                        if (result.has(ele.placeIdx)) result.get(ele.placeIdx).likeCnt = ele.likeCnt
                    })
        
                    getSubwayNames.forEach(ele => {
                        if (result.has(ele.placeIdx)) result.get(ele.placeIdx).subwayName.push(ele.subwayName)
                    })
        
            
                const resultMap = new Map();

                groupResult.forEach((group) => {
                    resultMap.set(group.groupIdx, {
                        userName: group.userName,
                        part: group.part,
                        userImage: group.profileImageUrl,
                        state: group.state,
                        postCount: 0,
                    });
                });
    
            
                if(placeResult.length !== 0) {
                    resultMap.get(placeResult[0].groupIdx).postCount = placeResult[0].postCount
                }

                let retObj = {};
                retObj.UserInfo = [...resultMap.values()]
                retObj.UserPlace  = [...result.values()];
                return retObj;
            }  catch (e) {
                console.log('다른유저의 프로필 불러오기 실패 :', e);
                throw e;
            }
        }

}
module.exports = group;