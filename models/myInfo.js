const pool = require('../modules/pool');
const _ = require('lodash');
const { getSubway } = require('../modules/table');
const myInfo = {
    getMyInfo: async (userIdx, groupIdx) => {
        //이름,소속,이미지,상태,유저 총 글 수 그룹이름
        try {
            const getMyInfo = `SELECT * FROM (SELECT * FROM GROUP_USER_RELATION_TB WHERE groupIdx = ${groupIdx} and userIdx = ${userIdx} and state NOT IN (2)) AS MYGROUPWAITUSER natural join USER_TB `;
            const groupResult = await pool.queryParam(getMyInfo);
            const placeResult = await pool.queryParam(
                `SELECT *, count(*) as postCount FROM PLACE_TB WHERE groupIdx = ${groupIdx} and userIdx = ${userIdx} GROUP BY groupIdx`
            );
            const bookMarkQuery = `SELECT *,count(*) as bookMarkCnt FROM (SELECT * FROM PLACE_TB WHERE placeIdx IN (SELECT placeIdx FROM BOOKMARK_TB WHERE userIdx=${userIdx}) AND groupIdx=${groupIdx}) as PLACE natural join USER_TB`;
            const bookMarkCnt = await pool.queryParam(bookMarkQuery);
            const getGroupName = `SELECT groupName FROM GROUP_TB WHERE groupIdx = ${groupIdx}`;
            let nameResult = await pool.queryParam(getGroupName);
            /* Boss의 뜻대로 둘러보기 그룹에 코드 숨기는 용.. */
            if (groupIdx == 19) {
                nameResult[0].groupName = '둘러보기';
            }
            const resultMap = new Map();

            groupResult.forEach((group) => {
                resultMap.set(group.groupIdx, {
                    userName: group.userName,
                    part: group.part,
                    groupName: nameResult[0].groupName,
                    userImage: group.profileImageUrl,
                    state: group.state,
                    postCount: 0,
                    bookMarkCnt: 0,
                });
            });

            if (placeResult.length !== 0) {
                resultMap.get(placeResult[0].groupIdx).postCount = placeResult[0].postCount;
            }

            if (bookMarkCnt[0].bookMarkCnt !== 0) {
                resultMap.get(bookMarkCnt[0].groupIdx).bookMarkCnt = bookMarkCnt[0].bookMarkCnt;
            }

            return [...resultMap.values()]; //객체를 풀어주고 {}를 다시 배열에 집어 넣는다
        } catch (err) {
            console.log('마이페이지 정보를 불러오지 못했습니다.: ', err);
            throw err;
        }
    },

    editMyInfo: async (userIdx, groupIdx, profileImageUrl, part) => {
        const editProfileImageQuery = `UPDATE GROUP_USER_RELATION_TB SET profileImageUrl = '${profileImageUrl}' WHERE userIdx = ${userIdx} and groupIdx = ${groupIdx};`;
        const editProfilePartQuery = `UPDATE GROUP_USER_RELATION_TB SET part = '${part}' WHERE userIdx = ${userIdx} and groupIdx = ${groupIdx};`;
        try {
            if (profileImageUrl === undefined) {
                const result1 = await pool.queryParam(editProfilePartQuery);
            } else {
                const result1 = await pool.queryParam(editProfilePartQuery);
                const result = await pool.queryParam(editProfileImageQuery);
            }
        } catch (err) {
            console.log('editStatusApplyUser ERROR : ', err);
            throw err;
        }
    },

    editProfileImage: async (userIdx, groupIdx, profileImageUrl) => {
        const editProfileImageQuery = `UPDATE GROUP_USER_RELATION_TB SET profileImageUrl = '${profileImageUrl}' WHERE userIdx = ${userIdx} and groupIdx = ${groupIdx};`;
        try {
            const result = await pool.queryParam(editProfileImageQuery);
        } catch (err) {
            console.log('editStatusApplyUser ERROR : ', err);
            throw err;
        }
    },

    editProfilePart: async (userIdx, groupIdx, part) => {
        const editProfilePartQuery = `UPDATE GROUP_USER_RELATION_TB SET part = '${part}' WHERE userIdx = ${userIdx} and groupIdx = ${groupIdx};`;
        try {
            const result = await pool.queryParam(editProfilePartQuery);
        } catch (err) {
            console.log('editStatusApplyUser ERROR : ', err);
            throw err;
        }
    },

    getPlacesWithUser: async (userIdx, groupIdx) => {
        const getPlacesWithUser = `SELECT placeIdx,placeImageUrl,placeName FROM (SELECT placeIdx,placeImageUrl,placeName, groupIdx, userIdx FROM PLACE_TB as p natural left outer join PLACEIMAGE_TB as i where p.placeIdx = i.placeIdx)as a WHERE a.groupIdx = ${groupIdx} and userIdx = ${userIdx} group by placeIdx`;
        const getPlaceCount = `SELECT count(*) as placeCount FROM (SELECT * FROM (SELECT placeIdx,placeImageUrl,placeName,groupIdx,userIdx FROM PLACE_TB as p natural left outer join PLACEIMAGE_TB as i where p.placeIdx = i.placeIdx)as a WHERE a.groupIdx = ${groupIdx} and userIdx = ${userIdx} group by placeIdx) as p natural left outer join USER_TB as u`;
        try {
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

            getPlacesInfo.forEach((ele) =>
                result.set(ele.placeIdx, {
                    placeIdx: ele.placeIdx,
                    placeName: ele.placeName,
                    placeImageUrl: ele.placeImageUrl.replace('origin', 'w_400'),
                    likeCnt: ele.likeCnt,
                    subwayName: ele.subwayName,
                })
            );

            getLikeCnt.forEach((ele) => {
                if (result.has(ele.placeIdx)) result.get(ele.placeIdx).likeCnt = ele.likeCnt;
            });

            getSubwayNames.forEach((ele) => {
                if (result.has(ele.placeIdx))
                    result.get(ele.placeIdx).subwayName.push(ele.subwayName);
            });

            const getCount = await pool.queryParam(getPlaceCount); // 작성한 글 총 갯수
            let retObj = {};
            retObj.UserPlace = [...result.values()];
            retObj.placeCount = getCount[0].placeCount;
            return retObj;
        } catch (err) {
            console.log('getPlacesWithUser', err);
            throw err;
        }
    },
};
module.exports = myInfo;
