const pool = require('../modules/pool');
const table = 'GROUP_USER_RELATION_TB';
const groupTable = 'GROUP_TB';
const STATE_PENDING = 2;
const _ = require('lodash');

const group = {
    // 그룹 신청하기 (안씀)
    // apply: async (groupIdx, userIdx) => { // 그룹신청할때 테이블 조인할때 userIdx값이 이미 회원가입할때 들어가니까 userIdx받아서 그 userIdx에 해당하는 테이블 group_user_테이블이랑 조인해서 이름,소속 넣어준다? state는 1로 넣어주고 
    //     const fields = 'groupIdx,userIdx,userName,part,state';
    //     const questions = `?, ?, ?, ?`;
    //     const values = [groupIdx, userIdx, part, phoneNumber];
    //     const query = `INSERT INTO USER_TB as a natural join GROUP_USER_RELATION_TB as b (${fields}) VALUES(${questions})`;
    //     try {
    //         const result = await pool.queryParamArr(query, values);
    //         const insertId = result.insertId;
    //         return insertId;
    //     } catch (err) {
    //         console.log('apply ERROR : ', err);
    //         throw err;
    //     }
    // },
    
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
    //유저 그룹 상태 가져오기( 왜씀?)
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
    //그룹 정보(이름과 사진) 불러오기
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
    // 그룹 총 유저 수 체크
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
    // 그룹 게시물 등록갯수 체크
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
    // 그룹대기 인원 수 체크
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
    // getMyGroupList: async (userIdx, queryObject) => { // 쿼리로 비슷한 기능들을 한 기능에 모을 수 있다.
    //     let getMygroup = `SELECT * FROM (SELECT * FROM GROUP_USER_RELATION_TB WHERE userIdx = ${userIdx}) AS MYRELATIONGROUP natural left outer join GROUP_TB `;
    //     if (queryObject.filter === 'wait')
    //         getMygroup += `WHERE MYRELATIONGROUP.state = 2`;
    //     else
    //         getMygroup += `WHERE MYRELATIONGROUP.state NOT IN(2)`;
    //     try {
    //         const result = await pool.queryParam(getMygroup);
    //         return result;
    //     } catch (err) {
    //         console.log('그룹들을 불러오지 못했습니다 getMyGroupList err. : ', err);
    //         throw err;
    //     }
    // },
    // getMyApplyGroupList: async (userIdx) => {
    //     const query = `SELECT * FROM (SELECT *, count(*) as userCount FROM placepic.GROUP_USER_RELATION_TB WHERE groupIdx NOT IN (SELECT groupIdx FROM placepic.GROUP_USER_RELATION_TB WHERE userIdx=${userIdx} ) Group by groupIdx) as T natural join GROUP_TB;`
    //     try {
    //         const groupResult = await pool.queryParam(query);
    //         if (groupResult.length === 0) {
    //             console.log("불러올 지원가능한 그룹이 없습니다.");
    //             return groupResult; //groupResult 가 [] 일때.
    //         }
    //         const groupIdxs = groupResult.map(group => group.groupIdx);
    //         const placeResult = await pool.queryParam(`SELECT *, count(*) as postCount FROM PLACE_TB WHERE groupIdx IN (${groupIdxs.length === 1 ? groupIdxs.join('') : groupIdxs.join(', ')}) GROUP BY groupIdx`);
    //         const resultMap = new Map();
    //         groupResult.forEach((group) => {
    //             resultMap.set(group.groupIdx, {
    //                 groupIdx: group.groupIdx,
    //                 state: group.state,
    //                 groupName: group.groupName,
    //                 groupImage: group.groupImage,
    //                 userCount: group.userCount,
    //                 postCount: 0,
    //             });
    //         });
    //         placeResult.forEach(place => resultMap.get(place.groupIdx).postCount = place.postCount);
    //         return [...resultMap.values()];
    //     } catch (e) {
    //         console.log('getMyApplyGroupList error(지원가능한 그룹목록을 불러오지 못했습니다.) :', err);
    //         throw e;
    //     }
    // },

    getMyGroupList: async (userIdx) => {
        const getGroupbyUser = `SELECT groupIdx, groupName, groupImage, groupCode , count(userIdx) as userCnt FROM GROUP_TB natural left outer join GROUP_USER_RELATION_TB group by groupIdx;`;
        try {
            const getGroupResult = await pool.queryParam(getGroupbyUser);
            console.log(getGroupResult);
            if (getGroupResult.length === 0) {
                console.log("불러올 지원가능한 그룹이 없습니다.");
                return getGroupResult; //groupResult 가 [] 일때.
            }
            const groupIdxs = getGroupResult.map(group => group.groupIdx);
            console.log(groupIdxs)
            const placeResult = await pool.queryParam(`SELECT *, count(*) as postCount FROM PLACE_TB WHERE groupIdx IN (${groupIdxs.length === 1 ? groupIdxs.join('') : groupIdxs.join(', ')}) GROUP BY groupIdx`);
            console.log(placeResult);
            const getState = await pool.queryParam(`SELECT * FROM placepic.GROUP_USER_RELATION_TB where userIdx = ${userIdx} group by groupIdx;`);
            
            console.log(getState);

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
    /*
    getMyGroupRanking: async (groupIdx) => {
        const query = `SELECT * FROM (SELECT * FROM placepic.GROUP_USER_RELATION_TB WHERE groupIdx = ${groupIdx} and state NOT IN (2)) AS MYGROUPWAITUSER natural join placepic.USER_TB ;`
            try {
                const groupResult = await pool.queryParam(query);
                if(_.isNil(groupResult)){
                    return groupResult; //groupResult 가 [] 일때.
                }
                const userIdxs = groupResult.map(group => group.userIdx); // => 뒤에 있는게 조건
                const placeResult = await pool.queryParam(`SELECT *, count(*) as postCount FROM PLACE_TB WHERE groupIdx = ${groupIdx} and userIdx IN (${userIdxs.join(', ')}) GROUP BY userIdx`);
                const resultMap = new Map();
                groupResult.forEach((group) => {
                    resultMap.set(group.userIdx, { //key = group.userIdx, value = 객체
                        groupIdx: group.groupIdx,
                        userIdx: group.userIdx,
                        userName: group.userName,
                        profileImageUrl : group.profileImageUrl,
                        state: group.state, 
                        part: group.part,
                        postCount: 0,
                    });
                });

                placeResult.forEach(place => resultMap.get(place.userIdx).postCount = place.postCount);
                return [...resultMap.values()].sort((a, b) => {
                    if(b.postCount !== a.postCount)  return  b.postCount - a.postCount;
                    else  return a.userName < b.userName? -1 : a.userName > b.userName ? 1 : 0;
                })


            } catch(e) {
                console.log('getMyGroupRanking error :',e);
                throw e;
            }
        },

    페이지네이션 
    getMyGroupRanking: async (page,groupIdx) => {

        const limit = 3;
        const offset = (page-1) * limit;
        const query = `SELECT userIdx, userName,profileImageUrl,count(placeName) as postCount FROM
        (SELECT * FROM 
        (SELECT * FROM GROUP_USER_RELATION_TB WHERE groupIdx = 1 and state not in (2))
         AS MYGROUPWAITUSER natural join USER_TB)
         AS POSTCOUNT natural left join PLACE_TB group by userIdx order by postCount DESC,userName limit ${limit} offset ${offset}`;
            try {
                const groupResult = await pool.queryParam(query);
                if(_.isNil(groupResult)){
                    return groupResult; //groupResult 가 [] 일때.
                }

                console.log(groupResult)


                return groupResult.sort((a, b) => {
                    if(b.postCount === a.postCount)  return a.userName < b.userName? -1 : a.userName > b.userName ? 1 : 0;
                })


            } catch(e) {
                console.log('get my apply group list error :',e);
                throw e;
            }
        },
    },*/
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
                    userName: group.userName,
                    profileImageUrl: group.profileImageUrl,
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
    
                //console.log(bookMarkCnt);
                //console.log(placeResult);
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
    /*
    getMyGroupRanking: async (page, groupIdx) => {
        const limit = 3;
        const offset = (page - 1) * limit
        const query = `SELECT userIdx, userName,part,profileImageUrl,count(placeName) as postCount FROM
                            (SELECT * FROM 
                            (SELECT * FROM GROUP_USER_RELATION_TB WHERE groupIdx = ${groupIdx} and state not in (2))
            AS MYGROUPWAITUSER natural join USER_TB)
            AS POSTCOUNT natural left join PLACE_TB group by userIdx order by postCount DESC,userName limit ${limit} offset ${offset}`;
        try {
            const groupResult = await pool.queryParam(query);
            if (_.isNil(groupResult)) {
                return groupResult; //groupResult 가 [] 일때.
            }
            const resultMap = new Map();
            groupResult.forEach((group) => {
                resultMap.set(group.userIdx, {
                    userName: group.userName,
                    profileImageUrl: group.profileImageUrl,
                    part: group.part,
                    postCount: group.postCount,
                    rank: 0
                });
            });

            //groupResult.forEach(group => { 
            //    let rank = 0;    
            //    if(groupResult.postCount === )
            //    resultMap.get(group.userIdx).postCount = group.postCount}); 
            console.log(groupResult);
            let rank = 0;
            for (let i = 0; i < groupResult.length; i++) {
                if (groupResult[i].postCount === 0) {
                    rank = '-';
                    [...resultMap.values()][i].rank = rank;
                }
                //console.log(groupResult[i].postCount)
                else if (i === groupResult.length - 1) {
                    [...resultMap.values()][i].rank = rank;
                    break;
                } else if (groupResult[i].postCount === groupResult[i + 1].postCount) {
                    // 전인덱스가 3 다음인덱스가 2  그리고 전인덱스가 2 다음인덱스가 2
                    if (groupResult[i - 1].postCount > groupResult[i].postCount) {
                        rank = rank + 1;
                        [...resultMap.values()][i].rank = rank;
                    } else
                        [...resultMap.values()][i].rank = rank;

                }
                //placeResult.forEach(place => resultMap.get(place.userIdx).postCount = place.postCount);
                else {
                    rank = rank + 1;
                    [...resultMap.values()][i].rank = rank;
                }
            }
            return [...resultMap.values()];
        } catch (e) {
            console.log('get my apply group list error :', e);
            throw e;
        }
    }*/

}
module.exports = group;