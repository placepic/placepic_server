const pool = require('../modules/pool');
const _ = require('lodash');
const myInfo = {
    getMyInfo: async (userIdx, groupIdx) => { //이름,소속,이미지,상태,유저 총 글 수
        try {
            const getMyInfo = `SELECT * FROM (SELECT * FROM GROUP_USER_RELATION_TB WHERE groupIdx = ${groupIdx} and userIdx = ${userIdx} and state NOT IN (2)) AS MYGROUPWAITUSER natural join USER_TB `;
            const groupResult = await pool.queryParam(getMyInfo);
            const placeResult = await pool.queryParam(`SELECT *, count(*) as postCount FROM PLACE_TB WHERE groupIdx = ${groupIdx} and userIdx = ${userIdx} GROUP BY groupIdx`);

            
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
            console.log(resultMap);
            placeResult.forEach(place => resultMap.get(place.groupIdx).postCount = place.postCount);
            console.log(resultMap)
            return [...resultMap.values()]; //객체를 풀어주고 {}를 다시 배열에 집어 넣는다
        } catch (err) {
            console.log('마이페이지 정보를 불러오지 못했습니다.: ', err);
            throw err;
        }
    },

    // editMyInfo : async (userIdx,groupIdx,profileImageUrl,part) => {
    //     const editProfileImageQuery = `UPDATE USER_TB as a natural left outer join GROUP_USER_RELATION_TB as b SET a.profileImageUrl = '${profileImageUrl}' WHERE a.userIdx = ${userIdx} and b.groupIdx = ${groupIdx};`;
    //     const editProfilePartQuery = `UPDATE USER_TB as a natural left outer join GROUP_USER_RELATION_TB as b SET b.part = '${part}' WHERE a.userIdx = ${userIdx} and b.groupIdx = ${groupIdx};`;
    //     try {
    //         const result = await pool.queryParam(editProfileImageQuery);
    //         const result1 =await pool.queryParam(editProfilePartQuery);

    //     } catch (err) {
    //         console.log('editStatusApplyUser ERROR : ', err);
    //         throw err;
    //     }
    // },
    editMyInfo : async (userIdx,groupIdx,profileImageUrl,part) => {
        const editProfileImageQuery = `UPDATE GROUP_USER_RELATION_TB SET profileImageUrl = '${profileImageUrl}' WHERE userIdx = ${userIdx} and groupIdx = ${groupIdx};`;
        const editProfilePartQuery = `UPDATE GROUP_USER_RELATION_TB SET part = '${part}' WHERE userIdx = ${userIdx} and groupIdx = ${groupIdx};`;
        try {
            const result = await pool.queryParam(editProfileImageQuery);
            const result1 =await pool.queryParam(editProfilePartQuery);

        } catch (err) {
            console.log('editStatusApplyUser ERROR : ', err);
            throw err;
        }
    },

    editProfileImage : async (userIdx,groupIdx,profileImageUrl) => {
        const editProfileImageQuery = `UPDATE GROUP_USER_RELATION_TB SET profileImageUrl = '${profileImageUrl}' WHERE userIdx = ${userIdx} and groupIdx = ${groupIdx};`;
        try {
            const result = await pool.queryParam(editProfileImageQuery);
        } catch (err) {
            console.log('editStatusApplyUser ERROR : ', err);
            throw err;
        }
    },

    editProfilePart : async (userIdx,groupIdx,part) => {
        const editProfilePartQuery = `UPDATE GROUP_USER_RELATION_TB SET part = '${part}' WHERE userIdx = ${userIdx} and groupIdx = ${groupIdx};`
        try {
            const result = await pool.queryParam(editProfilePartQuery);
        } catch (err) {
            console.log('editStatusApplyUser ERROR : ', err);
            throw err;
        }
    },

    getPlacesWithUser : async(userIdx,groupIdx) => {
        const getPlacesWithUser =  `SELECT placeIdx,placeImageUrl,placeName FROM (SELECT placeIdx,placeImageUrl,placeName, groupIdx, userIdx FROM PLACE_TB as p natural left outer join PLACEIMAGE_TB as i where p.placeIdx = i.placeIdx)as a WHERE a.groupIdx = ${groupIdx} and userIdx = ${userIdx} group by placeIdx`
        const getPlaceCount = `SELECT count(*) as placeCount FROM (SELECT * FROM (SELECT placeIdx,placeImageUrl,placeName,groupIdx,userIdx FROM PLACE_TB as p natural left outer join PLACEIMAGE_TB as i where p.placeIdx = i.placeIdx)as a WHERE a.groupIdx = ${groupIdx} and userIdx = ${userIdx} group by placeIdx) as p natural left outer join USER_TB as u`
        try{ 
            const getPlacesInfo = await pool.queryParam(getPlacesWithUser); // 작성한 이름,이미지,placeIdx
            if (_.isNil(getPlacesInfo)) {
                return getPlacesInfo; //groupResult 가 [] 일때.
            }
            const placeIdxs = getPlacesInfo.map(placeIdx => placeIdx.placeIdx);
            const likeCountQuery = `SELECT COUNT(*) as likeCnt FROM LIKE_TB WHERE placeIdx IN (${placeIdxs.length === 1 ? placeIdxs.join('') : placeIdxs.join(', ')}) group by placeIdx`; 
            const getSubwayName = `SELECT subwayName FROM SUBWAY_PLACE_RELATION_TB as a natural left outer join SUBWAY_TB as b WHERE a.placeIdx IN (${placeIdxs.length === 1 ? placeIdxs.join('') : placeIdxs.join(', ')}) group by placeIdx ;`;
            const getLikeCnt = await pool.queryParam(likeCountQuery); // 작성한 글 좋아요 갯수 목록
            const getSubwayNames = await pool.queryParam(getSubwayName); // 작성한 글 지하철 목록
            // getPlacesInfo.forEach(ele => {

            // })
            console.log(...getPlacesInfo);
            console.log(getLikeCnt);
            console.log(getSubwayNames)
            for(let i = 0; i< getPlacesInfo.length; i++) {
                getPlacesInfo[i].likeCnt = getLikeCnt[i].likeCnt;
                getPlacesInfo[i].subwayName = getSubwayNames[i].subwayName;
            }
            console.log(getPlacesInfo);

            console.log('----------------------------------------------------')
            const getCount = await pool.queryParam(getPlaceCount) // 작성한 글 총 갯수
            let retObj = {};
            retObj.UserPlace  = getPlacesInfo;
            retObj.placeCount = getCount[0].placeCount;
            console.log(retObj);
            return retObj;
        }catch(err){
            console.log('getPlacesWithUser', err);
            throw err;
        }
    }
}
module.exports = myInfo;