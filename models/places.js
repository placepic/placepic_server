const _ = require('lodash');
const pool = require('../modules/pool');
const moment = require('moment');
const table = 'PLACE_TB';
const placeImageTB = 'PLACEIMAGE_TB';
const placeTagTB = 'PLACE_TAG_RELATION_TB';
const userTB = 'USER_TB';
const subwayPlaceTB = 'SUBWAY_PLACE_RELATION_TB';
const likeTB = 'LIKE_TB';
const bookmarkTB = 'BOOKMARK_TB';
const subwayTB = 'SUBWAY_TB';
const tableModule = require('../modules/table');

const place = {
    addPlace: async ({
        title,
        address,
        roadAddress,
        mapx,
        mapy,
        placeReview,
        categoryIdx,
        groupIdx,
        tags,
        infoTags,
        subwayIdx,
        userIdx,
        imageUrl,
    }) => {
        const nowUnixTime = parseInt(moment().format('X'));
        const addPlaceQuery = `INSERT INTO ${table} (placeName, placeAddress, placeRoadAddress, placeMapX, placeMapY, placeCreatedAt, placeUpdatedAt, userIdx, placeReview, categoryIdx, groupIdx) VALUES (?,?,?,?,?,?,?,?,?,?,?)`;
        const addPlaceValues = [
            title,
            address,
            roadAddress,
            mapx,
            mapy,
            nowUnixTime,
            nowUnixTime,
            userIdx,
            placeReview,
            categoryIdx,
            groupIdx,
        ];
        const addPlaceImageQuery = `INSERT INTO ${placeImageTB} (placeIdx, placeImageUrl) VALUES(?,?)`;
        const addPlaceTagQuery = `INSERT INTO ${placeTagTB} (placeIdx, tagIdx) VALUES (?,?)`;
        const addPlaceSubwayQuery = `INSERT INTO ${subwayPlaceTB} (subwayIdx, placeIdx) VALUES (?,?)`;
        const getPlaceIdxQuery = `SELECT placeIdx FROM ${table} where groupIdx =${groupIdx} and placeMapX = ${mapx} and placeMapY = ${mapy}`;
        let tagIdxData = [...tags, ...infoTags];
        try {
            await pool
                .Transaction(async (conn) => {
                    let addPlaceResult = await conn.query(addPlaceQuery, addPlaceValues);
                    await conn.query(getPlaceIdxQuery, [groupIdx, mapx, mapy]);
                    let placeIdx = addPlaceResult.insertId; // insert문으로 place넣고난 담에 (회원가입이랑 똑같음) plaecTB의 placeIdx값 뽑아낸다.

                    for (let i = 0; i < imageUrl.length; i++) {
                        await conn.query(addPlaceImageQuery, [placeIdx, imageUrl[i]]); // 여기서는 placeImg테이블에 아까 구한 placeIdx값 넣어준다
                    }

                    for (let i = 0; i < tagIdxData.length; i++) {
                        await conn.query(addPlaceTagQuery, [parseInt(placeIdx), parseInt(tagIdxData[i])]);
                    }

                    for (let i in subwayIdx) {
                        await conn.query(addPlaceSubwayQuery, [parseInt(subwayIdx[i]), parseInt(placeIdx)]);
                    }
                })
                .catch((err) => {
                    console.log('장소 추가 트랜잭션 오류! :', err);
                    throw err;
                });
        } catch (e) {
            console.log('장소 추가 에러 :', e);
            throw e;
        }
    },
    addLike: async ({ userIdx, placeIdx }) => {
        const nowUnixTime = parseInt(moment().format('X'));
        const addLikeQuery = `INSERT INTO ${likeTB} (userIdx,placeIdx,likeCreatedAt) VALUES (?,?,?)`;
        try {
            const addLikeResult = await pool.queryParamArr(addLikeQuery, [userIdx, placeIdx, nowUnixTime]);
            return addLikeResult.insertId;
        } catch (err) {
            console.log('addLike 에러', err);
            throw err;
        }
    },
    addBookmark: async ({ userIdx, placeIdx }) => {
        const addBookmarkQuery = `INSERT INTO ${bookmarkTB} (userIdx,placeIdx) VALUES (?,?)`;
        try {
            const addBookmarkResult = await pool.queryParamArr(addBookmarkQuery, [userIdx, placeIdx]);
            return addBookmarkResult.insertId;
        } catch (err) {
            console.log('add bookmark 에러', err);
            throw err;
        }
    },
    getLikeIdx: async ({ userIdx, placeIdx }) => {
        const getLikeQuery = `SELECT * FROM ${likeTB} WHERE userIdx = ${userIdx} and placeIdx = ${placeIdx}`;
        try {
            const result = await pool.queryParam(getLikeQuery);
            return result;
        } catch (err) {
            console.log('get Like err', err);
            throw err;
        }
    },
    /**
     * getLikeList 수정
     * 수정한 부분 : profileImageUrl
     * 자세한 설명: 노션
     */
    getLikeList: async (placeIdx) => {
        const getLikeListQuery = `SELECT u.userName, u.profileImageUrl, l.likeCreatedAt, u.part 
                                FROM LIKE_TB as l
                                LEFT JOIN (SELECT u.userIdx, u.userName, g.profileImageUrl, g.part FROM USER_TB as u 
                                LEFT JOIN GROUP_USER_RELATION_TB as g on u.userIdx= g.userIdx 
                                WHERE groupIdx = (SELECT groupIdx FROM PLACE_TB WHERE placeIdx = ${placeIdx})) as u on l.userIdx = u.userIdx 
                                where placeIdx = ${placeIdx};`;
        try {
            const result = await pool.queryParam(getLikeListQuery);
            return result;
        } catch (err) {
            console.log('get like list err', err);
            throw err;
        }
    },
    getBookmarkIdx: async ({ userIdx, placeIdx }) => {
        const getBookmarkQuery = `SELECT * FROM ${bookmarkTB} WHERE userIdx = ${userIdx} and placeIdx = ${placeIdx}`;
        try {
            const result = await pool.queryParam(getBookmarkQuery);
            return result;
        } catch (err) {
            console.log('get bookmarkIdx err', err);
            throw err;
        }
    },
    getPlacesWithBookmark: async (userIdx, groupIdx) => {
        const tagTable = tableModule.getTag();
        const categoryTable = tableModule.getCategory();
        const subwayTable = tableModule.getSubwayGroup();
        try {
            const bookmarkQuery = `SELECT * FROM (SELECT * FROM ${table} WHERE placeIdx IN (SELECT placeIdx FROM ${bookmarkTB} WHERE userIdx=${userIdx}) AND groupIdx=${groupIdx}) as PLACE natural join USER_TB`;
            const placeResult = await pool.queryParam(bookmarkQuery);

            if (placeResult.length === 0) return [];
            const placeIdxs = new Set(placeResult.map((p) => p.placeIdx));

            const likeResult = await pool.queryParam(
                `SELECT placeIdx, count(*) as likeCount FROM LIKE_TB WHERE placeIdx IN (${[...placeIdxs].join(
                    ', '
                )}) GROUP BY placeIdx`
            );
            console.log(likeResult);
            const result = new Map();
            placeResult.forEach((ele) =>
                result.set(ele.placeIdx, {
                    placeIdx: ele.placeIdx,
                    placeName: ele.placeName,
                    placeAddress: ele.placeAddress,
                    placeRoadAddress: ele.placeRoadAddress,
                    placeMapX: ele.placeMapX,
                    placeMapY: ele.placeMapY,
                    placeCreatedAt: ele.placeCreatedAt,
                    placeUpdatedAt: ele.placeUpdatedAt,

                    placeReview: ele.placeReview,
                    category: categoryTable.find((category) => category.categoryIdx === ele.categoryIdx),
                    groupIdx: ele.groupIdx,
                    placeViews: ele.placeViews,
                    tag: [],
                    subway: [],
                    user: {
                        userIdx: ele.userIdx,
                        userName: ele.userName ? ele.userName : '',
                        email: ele.email ? ele.email : '',
                        profileURL: ele.userProfileImageUrl ? ele.userProfileImageUrl : '',
                    },
                    imageUrl: [],
                    likeCount:
                        _.findIndex(likeResult, (like) => like.placeIdx === ele.placeIdx) !== -1
                            ? _.find(likeResult, (like) => like.placeIdx === ele.placeIdx).likeCount
                            : 0,
                })
            );

            const imageResult = await pool.queryParam(
                `SELECT placeIdx, placeImageUrl, thumbnailImage FROM PLACEIMAGE_TB WHERE placeIdx IN (${[
                    ...placeIdxs,
                ].join(', ')})`
            );

            imageResult.forEach((ele) => {
                if (result.has(ele.placeIdx)) result.get(ele.placeIdx).imageUrl.push(ele.placeImageUrl);
            });
            const subwayResult = await pool.queryParam(
                `SELECT subwayIdx, placeIdx FROM SUBWAY_PLACE_RELATION_TB WHERE placeIdx IN (${[...placeIdxs].join(
                    ', '
                )})`
            );
            subwayResult.forEach((ele) => {
                if (result.has(ele.placeIdx))
                    result.get(ele.placeIdx).subway.push(subwayTable.find((sub) => sub.subwayIdx === ele.subwayIdx));
            });

            const tagResult = await pool.queryParam(
                `SELECT tagIdx, placeIdx FROM PLACE_TAG_RELATION_TB WHERE placeIdx IN (${[...placeIdxs].join(', ')})`
            );
            tagResult.forEach((ele) => {
                if (result.has(ele.placeIdx))
                    result.get(ele.placeIdx).tag.push(tagTable.find((tag) => tag.tagIdx === ele.tagIdx));
            });
            return [...result.values()];
        } catch (e) {
            throw e;
        }
    },
    getPlacesByQuery: async (groupIdx, query) => {
        try {
            const subwayTable = tableModule.getSubwayGroup();
            const tagTable = tableModule.getTag();
            const categoryTable = tableModule.getCategory();

            const placeTable = `SELECT * FROM ${table} WHERE groupIdx=${groupIdx} AND (placeName LIKE "%${query}%")`;
            const placeTagQuery = `SELECT * FROM (SELECT * FROM (${placeTable}) as PLACE natural left outer join PLACE_TAG_RELATION_TB) as PLACETAG natural left outer join USER_TB`;
            const placeSubwayQuery = `SELECT * FROM (SELECT * FROM (${placeTable}) as PLACE natural left outer join SUBWAY_PLACE_RELATION_TB) as PLACESUBWAY natural left outer join USER_TB`;
            const queryResult = new Map();

            (await pool.queryParam(placeTagQuery)).concat(await pool.queryParam(placeSubwayQuery)).forEach((ele) => {
                if (queryResult.has(ele.placeIdx)) {
                    if (!_.isNil(ele.tagIdx))
                        queryResult.get(ele.placeIdx).tag.push(tagTable.find((tag) => tag.tagIdx === ele.tagIdx));
                    if (!_.isNil(ele.subwayIdx))
                        queryResult
                            .get(ele.placeIdx)
                            .subway.push(subwayTable.find((sub) => sub.subwayIdx === ele.subwayIdx));
                } else {
                    queryResult.set(ele.placeIdx, {
                        placeIdx: ele.placeIdx,
                        placeName: ele.placeName,
                        placeAddress: ele.placeAddress,
                        placeRoadAddress: ele.placeRoadAddress,
                        placeMapX: ele.placeMapX,
                        placeMapY: ele.placeMapY,
                        placeCreatedAt: ele.placeCreatedAt,
                        placeUpdatedAt: ele.placeUpdatedAt,
                        placeReview: ele.placeReview,
                        category: categoryTable.find((category) => category.categoryIdx === ele.categoryIdx),
                        groupIdx: ele.groupIdx,
                        placeViews: ele.placeViews,
                        tag: _.isNil(ele.tagIdx) ? [] : [tagTable.find((tag) => tag.tagIdx === ele.tagIdx)],
                        subway: _.isNil(ele.subwayIdx)
                            ? []
                            : [subwayTable.find((sub) => sub.subwayIdx === ele.subwayIdx)],
                        user: {
                            userIdx: ele.userIdx,
                            userName: ele.userName ? ele.userName : '',
                            email: ele.email ? ele.email : '',
                            profileURL: ele.userProfileImageUrl ? ele.userProfileImageUrl : '',
                        },
                        imageUrl: [],
                    });
                }
            });

            if (queryResult.size === 0) return [];
            const placeIdxSet = new Set([...queryResult.values()].map((q) => q.placeIdx));
            const images = await pool.queryParam(
                `SELECT placeIdx, placeImageUrl, thumbnailImage FROM PLACEIMAGE_TB WHERE placeIdx IN (${
                    [...placeIdxSet].length === 1 ? [...placeIdxSet].join('') : [...placeIdxSet].join(', ').slice(0, -2)
                })`
            );

            images.forEach((img) => {
                if (queryResult.has(img.placeIdx)) queryResult.get(img.placeIdx).imageUrl.push(img.placeImageUrl);
            });

            return [...queryResult.values()];
        } catch (e) {
            throw e;
        }
    },
    getAllPlaces: async () => {
        try {
            return await pool.queryParam(`SELECT * FROM ${table}`);
        } catch (e) {
            throw e;
        }
    },
    getPlacesByGroup: async (groupIdx, queryObject) => {
        try {
            const tagTable = tableModule.getTag();
            const categoryTable = tableModule.getCategory();
            const subwayTable = tableModule.getSubwayGroup();
            let placeTable = `SELECT * FROM ${table} WHERE groupIdx=${groupIdx}`;
            // let placeTable = `SELECT * FROM (SELECT * FROM ${table} WHERE groupIdx=${groupIdx}) as PLACE
            //     natural left outer join GROUP_USER_RELATION_TB`;
            if (queryObject.categoryIdx !== undefined) placeTable += ` and categoryIdx=${queryObject.categoryIdx}`;

            placeTable = `SELECT * FROM (${placeTable}) as PLACE natural left outer join GROUP_USER_RELATION_TB`;

            const placeTagQuery = `SELECT * FROM 
                (SELECT * FROM (${placeTable}) as PLACE natural left outer join PLACE_TAG_RELATION_TB) as PLACETAG 
                natural left outer join USER_TB`;
            const placeSubwayQuery = `SELECT * FROM 
                (SELECT * FROM (${placeTable}) as PLACE natural left outer join SUBWAY_PLACE_RELATION_TB) as PLACESUBWAY 
                natural left outer join USER_TB`;

            const queryResult = new Map();

            (await pool.queryParam(placeTagQuery)).concat(await pool.queryParam(placeSubwayQuery)).forEach((ele) => {
                if (queryResult.has(ele.placeIdx)) {
                    if (!_.isNil(ele.tagIdx))
                        queryResult.get(ele.placeIdx).tag.push(tagTable.find((tag) => tag.tagIdx === ele.tagIdx));
                    if (!_.isNil(ele.subwayIdx))
                        queryResult
                            .get(ele.placeIdx)
                            .subway.push(subwayTable.find((sub) => sub.subwayIdx === ele.subwayIdx));
                } else {
                    queryResult.set(ele.placeIdx, {
                        placeIdx: ele.placeIdx,
                        placeName: ele.placeName,
                        placeAddress: ele.placeAddress,
                        placeRoadAddress: ele.placeRoadAddress,
                        placeMapX: ele.placeMapX,
                        placeMapY: ele.placeMapY,
                        placeCreatedAt: ele.placeCreatedAt,
                        placeUpdatedAt: ele.placeUpdatedAt,

                        placeReview: ele.placeReview,
                        category: categoryTable.find((category) => category.categoryIdx === ele.categoryIdx),
                        groupIdx: ele.groupIdx,
                        placeViews: ele.placeViews,
                        tag: _.isNil(ele.tagIdx) ? [] : [tagTable.find((tag) => tag.tagIdx === ele.tagIdx)],
                        subway: _.isNil(ele.subwayIdx) ? [] : [subwayTable.find(ele.subwayIdx)],
                        user: {
                            userIdx: ele.userIdx,
                            userName: ele.userName ? ele.userName : '',
                            email: ele.email ? ele.email : '',
                            profileURL: ele.profileImageUrl ? ele.profileImageUrl.replace("origin","w_200") : '',
                        },
                        imageUrl: [],
                    });
                }
            });

            if (queryResult.size === 0) return [];
            const placeIdxSet = new Set([...queryResult.values()].map((q) => q.placeIdx));

            const images = await pool.queryParam(
                `SELECT placeIdx, placeImageUrl, thumbnailImage FROM PLACEIMAGE_TB WHERE placeIdx IN (${
                    placeIdxSet.size === 1 ? [...placeIdxSet].join('') : [...placeIdxSet].join(', ')
                })`
            );

            images.forEach((img) => {
                if (queryResult.has(img.placeIdx)) queryResult.get(img.placeIdx).imageUrl.push(img.placeImageUrl.replace("origin", "w_400"));
            });

            // filtering
            let result = [...queryResult.values()];

            if (!_.isNil(queryObject.categoryIdx)) {
                if (!_.isNil(queryObject.tagIdx)) {
                    result = result.filter((ele) => {
                        for (let tagIdx of queryObject.tagIdx.split(',')) {
                            if (ele.tag.findIndex((tag) => tag.tagIdx === tagIdx * 1) === -1) return false;
                        }
                        return true;
                    });
                }
            }

            if (!_.isNil(queryObject.subwayIdx)) {
                result = result.filter((ele) => {
                    for (let subwayIdx of queryObject.subwayIdx.split(',')) {
                        if (ele.subway.findIndex((sub) => sub.subwayIdx === subwayIdx * 1) !== -1) return true;
                    }
                    return false;
                });
            }
            return result;
        } catch (e) {
            throw e;
        }
    },
    getOnePlace: async ({ userIdx, placeIdx }) => {
        const placeQuery = `SELECT categoryIdx, placeName, placeReview, placeCreatedAt, placeRoadAddress, placeMapX, placeMapY FROM ${table} WHERE placeIdx =${placeIdx}`;
        const subwayNameQuery = `SELECT * FROM ${subwayTB} WHERE subwayIdx IN (SELECT subwayIdx FROM ${table} as p LEFT JOIN ${subwayPlaceTB} as r on p.placeIdx=r.placeIdx WHERE p.placeIdx = ${placeIdx})`;
        const placeImageQuery = `SELECT * FROM ${placeImageTB} WHERE placeIdx = ${placeIdx}`;
        const tagQuery = `SELECT tagName, tagIsBasic FROM PLACE_TAG_RELATION_TB as p LEFT JOIN TAG_TB as t on p.tagIdx = t.tagIdx WHERE placeIdx = ${placeIdx}`;
        const isBookmarkedQuery = `SELECT * FROM ${bookmarkTB} WHERE userIdx = ${userIdx} and placeIdx = ${placeIdx}`;
        const isLikedQuery = `SELECT * FROM ${likeTB} WHERE userIdx = ${userIdx} and placeIdx = ${placeIdx}`;
        const likeCountQuery = `SELECT COUNT(*) as likeCnt FROM ${likeTB} WHERE placeIdx = ${placeIdx}`;
        const bookmarkCountQuery = `SELECT COUNT(*) as bookmarkCnt FROM ${bookmarkTB} WHERE userIdx = ${userIdx} and placeIdx = ${placeIdx}`;
        const userQuery = `SELECT u.userIdx, u.userName, g.profileImageUrl, g.part 
                        FROM USER_TB as u LEFT JOIN GROUP_USER_RELATION_TB as g on u.userIdx= g.userIdx 
                        WHERE groupIdx = (SELECT groupIdx FROM PLACE_TB WHERE placeIdx = ${placeIdx}) and u.userIdx = (SELECT userIdx FROM PLACE_TB WHERE placeIdx =${placeIdx});;`;
        const postQuery = `SELECT COUNT(*) as postCount FROM PLACE_TB WHERE userIdx = ${userIdx} and groupIdx =(SELECT groupIdx FROM PLACE_TB WHERE placeIdx = ${placeIdx})`;
        const isMyPlaceQuery = `SELECT u.userIdx, p.placeIdx FROM USER_TB as u LEFT JOIN PLACE_TB as p on u.userIdx = p.userIdx WHERE u.userIdx = ${userIdx} and p.placeIdx = ${placeIdx}`;
        const isAdminQuery = `SELECT state FROM GROUP_USER_RELATION_TB WHERE groupIdx = (SELECT groupIdx FROM PLACE_TB WHERE placeIdx = ${placeIdx}) and userIdx = ${userIdx}`;
        try {
            let retObj = {};
            const placeResult = await pool.queryParam(placeQuery);
            const subwayName = await pool.queryParam(subwayNameQuery);
            const placeImageUrl = await pool.queryParam(placeImageQuery);
            const tag = await pool.queryParam(tagQuery);
            const isLikedResult = await pool.queryParam(isLikedQuery);
            const isBookmarkedResult = await pool.queryParam(isBookmarkedQuery);
            const likeCount = await pool.queryParam(likeCountQuery);
            const bookmarkCount = await pool.queryParam(bookmarkCountQuery);
            const writer = await pool.queryParam(userQuery);
            const postCount = await pool.queryParam(postQuery);
            const isMyPlaceResult = await pool.queryParam(isMyPlaceQuery);
            const isAdminResult = await pool.queryParam(isAdminQuery);

            retObj = { ...placeResult[0] };
            retObj.isLiked = !_.isNil(isLikedResult[0]);
            retObj.isBookmarked = !_.isNil(isBookmarkedResult[0]);
            retObj.likeCount = likeCount[0].likeCnt;
            retObj.bookmarkCount = bookmarkCount[0].bookmarkCnt;

            retObj.subway = [];
            for (let it in subwayName) {
                retObj.subway.push(subwayName[it].subwayName);
            }

            retObj.imageUrl = [];
            for (let it in placeImageUrl) {
                retObj.imageUrl.push(placeImageUrl[it].placeImageUrl.replace("origin", "w_400"));
            }

            retObj.keyword = [];
            retObj.placeInfo = [];

            for (let it in tag) {
                if (tag[it].tagIsBasic === 0) {
                    retObj.keyword.push(tag[it].tagName);
                } else {
                    retObj.placeInfo.push(tag[it].tagName);
                }
            }

            writer[0].postCount = postCount[0].postCount;
            writer[0].deleteBtn = !_.isNil(isMyPlaceResult[0]) || isAdminResult[0].state === 0;
            writer[0].profileImageUrl = writer[0].profileImageUrl.replace("origin", "w_200");
            retObj.uploader = writer[0];
            retObj.mobileNaverMapLink =
                'http://m.map.naver.com/search2/search.nhn?query=' +
                placeResult[0].placeName +
                '&sm=hty&style=v5#/map/1';
            return retObj;
        } catch (err) {
            console.log('get one place err', err);
            throw err;
        }
    },
    deleteLike: async ({ userIdx, placeIdx }) => {
        const deleteLikeQuery = `DELETE FROM ${likeTB} WHERE userIdx = ${userIdx} and placeIdx = ${placeIdx}`;
        try {
            const result = await pool.queryParam(deleteLikeQuery);
            return result;
        } catch (err) {
            console.log('deleteLike 에러', err);
            throw err;
        }
    },
    deleteBookmark: async ({ userIdx, placeIdx }) => {
        const deleteBookmarkQuery = `DELETE FROM ${bookmarkTB} WHERE userIdx = ${userIdx} and placeIdx = ${placeIdx}`;
        try {
            const result = await pool.queryParam(deleteBookmarkQuery);
            return result;
        } catch (err) {
            console.log('delete bookmark 에러', err);
            throw err;
        }
    },
    deletePlace: async (placeIdx) => {
        const deleteImageQuery = `DELETE FROM PLACEIMAGE_TB WHERE placeIdx = ?`;
        const deleteTagQuery = `DELETE FROM PLACE_TAG_RELATION_TB WHERE placeIdx = ?`;
        const deleteSubwayQuery = `DELETE FROM SUBWAY_PLACE_RELATION_TB WHERE placeIdx = ?`;
        const deletePlaceQuery = `DELETE FROM PLACE_TB WHERE placeIdx = ? `;
        const deleteLikeQuery = `DELETE FROM LIKE_TB WHERE placeIdx = ?`;
        const deleteBookmarkQuery = `DELETE FROM BOOKMARK_TB WHERE placeIdx = ?`;

        try {
            await pool
                .Transaction(async (conn) => {
                    await conn.query(deleteImageQuery, placeIdx);
                    await conn.query(deleteTagQuery, placeIdx);
                    await conn.query(deleteSubwayQuery, placeIdx);
                    await conn.query(deleteLikeQuery, placeIdx);
                    await conn.query(deleteBookmarkQuery, placeIdx);
                    await conn.query(deletePlaceQuery, placeIdx);
                })
                .catch((err) => {
                    console.log('장소 삭제 트랜잭션 오류');
                    throw err;
                });
        } catch (err) {
            console.log('delete Place error', err);
            throw err;
        }
    },
    isCheckPlace: async (placeIdx) => {
        const isCheckPlace = `SELECT * FROM ${table} WHERE placeIdx = ${placeIdx}`;
        try {
            const result = await pool.queryParam(isCheckPlace);
            return result;
        } catch (err) {
            console.log('place 체크 오류', err);
            throw err;
        }
    },
    isMyPlacePost: async (userIdx, placeIdx) => {
        const query = `SELECT * FROM PLACE_TB WHERE placeIdx = ${placeIdx} and userIdx = ${userIdx}`;
        try {
            const result = await pool.queryParam(query);
            return result[0];
        } catch (err) {
            console.log('isMyPlacePost err', err);
            throw err;
        }
    },
    isAdmin: async (userIdx, placeIdx) => {
        const query = `SELECT state FROM GROUP_USER_RELATION_TB WHERE groupIdx = (SELECT groupIdx FROM PLACE_TB WHERE placeIdx = ${placeIdx}) and userIdx = ${userIdx}`;
        try {
            const result = await pool.queryParam(query);
            return result[0].state;
        } catch (err) {
            console.log('isAdmin err', err);
            throw err;
        }
    },
    getPlacesAtHome: async (groupIdx) => {
        const getPlaceResult = `SELECT userIdx,placeIdx,groupIdx,userName,part,profileImageUrl,placeName,placeReview,placeImageUrl,placeCreatedAt FROM (SELECT * FROM (SELECT * FROM PLACE_TB as p1 natural join PLACEIMAGE_TB as p2 where p1.groupIdx = ${groupIdx} group by p1.placeIdx) as a natural left outer join GROUP_USER_RELATION_TB as b WHERE a.userIdx = b.userIdx) as c natural join USER_TB as d order by placeIdx desc;`;
        // 유저정보, 장소정보 목록
        const subwayResult = `SELECT * FROM SUBWAY_TB natural join SUBWAY_PLACE_RELATION_TB;`;
        // plaecIdx포함된 쿼리문 뽑아내면 댐
        const tagResult = `SELECT placeIdx,tagName,tagIsBasic FROM TAG_TB natural join PLACE_TAG_RELATION_TB`;
        const likeResult = `SELECT placeIdx, count(*) likeCnt FROM LIKE_TB group by placeIdx;`;
        console.log(likeResult);
        try {
            const getUserPlace = await pool.queryParam(getPlaceResult);
            const getsubway = await pool.queryParam(subwayResult);
            const getTag = await pool.queryParam(tagResult);
            const getLikeCnt = await pool.queryParam(likeResult);
            let result = new Map();
            getUserPlace.forEach((ele) =>
                result.set(ele.placeIdx, {
                    userIdx: ele.userIdx,
                    placeIdx: ele.placeIdx,
                    groupIdx: ele.groupIdx,
                    userName: ele.userName,
                    part: ele.part,
                    profileImageUrl: ele.profileImageUrl,
                    placeName: ele.placeName,
                    placeReview: ele.placeReview,
                    placeImageUrl: ele.placeImageUrl,
                    placeCreatedAt: ele.placeCreatedAt,
                    subway: [],
                    tag: [],
                    likeCnt: 0,
                })
            );
            getTag.forEach((ele) => {
                if (result.has(ele.placeIdx)) result.get(ele.placeIdx).tag.push(ele.tagName);
            });
            // getTag.forEach(ele => {

            //         if(!resultTag.has(ele.placeIdx)) resultTag.set(ele.placeIdx,[])
            //         resultTag.get(ele.placeIdx).push(ele.tagName)
            // })
            console.log(resultTag);
            getLikeCnt.forEach((ele) => {
                if (result.has(ele.placeIdx)) result.get(ele.placeIdx).likeCnt = ele.likeCnt;
            });
            // getLikeCnt.forEach(ele => {
            //     if(!resultLikeCnt.has(ele.placeIdx)) resultLikeCnt.set(ele.placeIdx, 0)
            //         resultLikeCnt.set(ele.placeIdx,ele.likeCnt)

            // })
            getsubway.forEach((ele) => {
                if (result.has(ele.placeIdx)) result.get(ele.placeIdx).subway.push(ele.subwayName);
            });
            return [...result.values()];
        } catch (err) {
            console.log('getPlacesHome err', err);
            throw err;
        }
    },

    getPlacesAtHomeByPage: async (page, groupIdx) => {
        const limit = 5;
        const offset = (page - 1) * limit;
        const totalCount = `SELECT count(*) totalCount FROM (SELECT * FROM (SELECT * FROM PLACE_TB as p1 natural join PLACEIMAGE_TB as p2 where p1.groupIdx = ${groupIdx} group by p1.placeIdx) as a natural left outer join GROUP_USER_RELATION_TB as b WHERE a.userIdx = b.userIdx) as c natural join USER_TB as d order by placeIdx desc;`;
        const getPlaceResult = `SELECT userIdx,placeIdx,groupIdx,userName,part,profileImageUrl,placeName,placeReview,placeImageUrl,placeCreatedAt FROM (SELECT * FROM (SELECT * FROM PLACE_TB as p1 natural join PLACEIMAGE_TB as p2 where p1.groupIdx = ${groupIdx} group by p1.placeIdx) as a natural left outer join GROUP_USER_RELATION_TB as b WHERE a.userIdx = b.userIdx) as c natural join USER_TB as d order by placeIdx desc limit ${limit} offset ${offset};`;
        // 유저정보, 장소정보 목록
        const subwayResult = `SELECT * FROM SUBWAY_TB natural join SUBWAY_PLACE_RELATION_TB;`;
        // plaecIdx포함된 쿼리문 뽑아내면 댐
        const tagResult = `SELECT placeIdx,tagName,tagIsBasic FROM TAG_TB natural join PLACE_TAG_RELATION_TB`;
        const likeResult = `SELECT placeIdx, count(*) likeCnt FROM LIKE_TB group by placeIdx;`;
        try {
            const getUserPlace = await pool.queryParam(getPlaceResult);
            const getsubway = await pool.queryParam(subwayResult);
            const getTag = await pool.queryParam(tagResult);
            const getLikeCnt = await pool.queryParam(likeResult);
            const getTotalCount = await pool.queryParam(totalCount);
            let totalPage = parseInt(getTotalCount[0].totalCount / limit);
            if (getTotalCount[0].totalCount % limit > 0) totalPage = totalPage + 1;

            if (totalPage < page) {
                page = totalPage;
            }
            console.log(totalPage);
            let result = new Map();
            getUserPlace.forEach((ele) =>
                result.set(ele.placeIdx, {
                    userIdx: ele.userIdx,
                    placeIdx: ele.placeIdx,
                    groupIdx: ele.groupIdx,
                    userName: ele.userName,
                    part: ele.part,
                    profileImageUrl: ele.profileImageUrl,
                    placeName: ele.placeName,
                    placeReview: ele.placeReview,
                    placeImageUrl: ele.placeImageUrl,
                    placeCreatedAt: ele.placeCreatedAt,
                    subway: [],
                    tag: [],
                    likeCnt: 0,
                })
            );
            getTag.forEach((ele) => {
                if (result.has(ele.placeIdx)) result.get(ele.placeIdx).tag.push(ele.tagName);
            });
            // getTag.forEach(ele => {

            //         if(!resultTag.has(ele.placeIdx)) resultTag.set(ele.placeIdx,[])
            //         resultTag.get(ele.placeIdx).push(ele.tagName)
            // })
            getLikeCnt.forEach((ele) => {
                if (result.has(ele.placeIdx)) result.get(ele.placeIdx).likeCnt = ele.likeCnt;
            });
            // getLikeCnt.forEach(ele => {
            //     if(!resultLikeCnt.has(ele.placeIdx)) resultLikeCnt.set(ele.placeIdx, 0)
            //         resultLikeCnt.set(ele.placeIdx,ele.likeCnt)

            // })
            getsubway.forEach((ele) => {
                if (result.has(ele.placeIdx)) result.get(ele.placeIdx).subway.push(ele.subwayName);
            });
            const resultValue = [...result.values()];

            // TODO 동관
            // 이부분 변경했습니다! (totalPage를 배열 밖으로 처리했슴다)
            // response 변경된 부분 wiki도 수정했습니다!! 확인부탁드림다!
            // https://github.com/placepic/placepic_server/wiki/%5BGET%5D-%ED%99%88-%ED%99%94%EB%A9%B4-%EC%9E%A5%EC%86%8C%EB%A6%AC%EC%8A%A4%ED%8A%B8-%ED%8E%98%EC%9D%B4%EC%A7%80%EB%84%A4%EC%9D%B4%EC%85%98-(%EB%8F%99%EA%B4%80-SP3)

            // resultValue.push({ totalPage: totalPage });
            return { places: resultValue, totalPage };
        } catch (err) {
            console.log('getPlacesAtHome err', err);
            throw err;
        }
    },

    getBanner: async (groupIdx) => {
        const bannerQuery = `SELECT * FROM BANNER_TB WHERE groupIdx = ${groupIdx}`;
        try {
            const bannerList = await pool.queryParam(bannerQuery);
            return bannerList;
        } catch (err) {
            throw err;
        }
    },
    getBannerPlaces: async (bannerIdx) => {
        try {
            const getOneBannerQuery = `SELECT bannerTitle, bannerBadgeName, bannerDescription, bannerBadgeColor, bannerCreatedAt, bannerImageUrl FROM BANNER_TB WHERE bannerIdx = ${bannerIdx}`;
            const getPlaceIndexQuery = `SELECT placeIdx FROM PLACE_BANNER_RELATION_TB WHERE bannerIdx = ${bannerIdx}`;
            const getPlaceList = await pool.queryParam(getPlaceIndexQuery);
            let placeIdxs = getPlaceList.map((it) => it.placeIdx);
            const getLikeQuery = `SELECT l.placeIdx, count(*) as cnt FROM LIKE_TB as l left join PLACE_TB as p on l.placeIdx = p.placeIdx WHERE l.placeIdx in (${[
                ...placeIdxs,
            ].join(', ')}) group by l.placeIdx;`;
            const getPlaceQuery = `SELECT placeIdx, placeName FROM PLACE_TB WHERE placeIdx in (${[...placeIdxs].join(
                ', '
            )})`;
            const getPlaceImageQuery = `SELECT placeIdx, placeImageUrl FROM PLACEIMAGE_TB WHERE placeIdx in (${[
                ...placeIdxs,
            ].join(', ')})`;
            const getPlaceSubwayQuery = `SELECT sp.placeIdx, s.subwayName FROM SUBWAY_PLACE_RELATION_TB as sp 
                LEFT JOIN SUBWAY_TB as s on sp.subwayIdx = s.subwayIdx 
                WHERE sp.placeIdx in (${[...placeIdxs].join(', ')})`;

            const getOneBanner = await pool.queryParam(getOneBannerQuery);
            const getLike = await pool.queryParam(getLikeQuery);
            const getPlace = await pool.queryParam(getPlaceQuery);
            const getPlaceImage = await pool.queryParam(getPlaceImageQuery);
            const getPlaceSubway = await pool.queryParam(getPlaceSubwayQuery);
            const result = new Map();
            getPlace.forEach((ele) =>
                result.set(ele.placeIdx, {
                    placeIdx: ele.placeIdx,
                    placeName: ele.placeName,
                    likeCnt: 0,
                    subwayName: [],
                })
            );

            getLike.forEach((ele) => {
                if (result.has(ele.placeIdx)) result.get(ele.placeIdx).likeCnt = ele.cnt;
            });

            getPlaceImage.forEach((ele) => {
                if (result.has(ele.placeIdx) && !result.has(ele.imageUrl))
                    result.get(ele.placeIdx).placeImageUrl = ele.placeImageUrl;
            });

            getPlaceSubway.forEach((ele) => {
                if (result.has(ele.placeIdx)) result.get(ele.placeIdx).subwayName.push(ele.subwayName);
            });
            return {
                banner: getOneBanner[0],
                places: [...result.values()],
            };
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    isGroupBanner: async ({ groupIdx, bannerIdx }) => {
        const bannerQuery = `SELECT COUNT(*) as cnt FROM BANNER_TB WHERE groupIdx = ${groupIdx} and bannerIdx = ${bannerIdx}`;
        try {
            const dto = await pool.queryParam(bannerQuery);
            const isGroupBanner = dto[0].cnt === 1 ? true : false;
            return isGroupBanner;
        } catch (err) {
            throw err;
        }
    },
};

module.exports = place;
