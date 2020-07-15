const pool = require('../modules/pool');
const table = 'GROUP_USER_RELATION_TB';
const myInfo = {

    getMyInfo : async(userIdx,groupIdx) => { //이름,소속,이미지,상태,유저 총 글 수

        try{    
            const getMyInfo = `SELECT * FROM (SELECT * FROM GROUP_USER_RELATION_TB WHERE groupIdx = ${groupIdx} and userIdx = ${userIdx} and state NOT IN (2)) AS MYGROUPWAITUSER natural join USER_TB `;
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
            
            return [...resultMap.values()]; //객체를 풀어주고 {}를 다시 배열에 집어 넣는다
        }catch(err) {
            console.log('마이페이지 정보를 불러오지 못했습니다.: ', err);
            throw err;
        }
    },
}
module.exports = myInfo;