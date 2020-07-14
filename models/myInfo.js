const pool = require('../modules/pool');
const table = 'GROUP_USER_RELATION_TB';
const myInfo = {

    getMyInfo : async(userIdx,groupIdx) => { //이름,소속,이미지,상태,유저 총 글 수

        try{    
            const getMyInfo = `SELECT * FROM (SELECT * FROM GROUP_USER_RELATION_TB WHERE groupIdx = ${groupIdx} and userIdx = ${userIdx}) AS MYGROUPWAITUSER natural join USER_TB `;
            const groupResult = await pool.queryParam(getMyInfo);
            const placeResult = await pool.queryParam(`SELECT *, count(*) as postCount FROM PLACE_TB WHERE groupIdx = ${groupIdx} and userIdx = ${userIdx} GROUP BY groupIdx`);
        
            const resultMap = new Map();
            groupResult.forEach((group) => {
            resultMap.set(group.groupIdx, {
                    userName : group.userName,
                    part : group.part,
                    userImage : group.profileImageUrl,
                    state : group.state,
                    postCount : 0,

            });
            });
            placeResult.forEach(place => resultMap.get(place.groupIdx).postCount = place.postCount);
            // console.log(resultMap);
            // console.log('-----------------------------');
            // console.log(placeResult);
            return [...resultMap.values()];
     

        }catch(err) {
            console.log('getMyInfo ERROR : ', err);
            throw err;
        }
    },

}

module.exports = myInfo;