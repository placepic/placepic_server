let responseMessage = require('../modules/responseMessage');
let statusCode = require('../modules/statusCode');
let util = require('../modules/util');
let Group = require('../models/group');
const crypto = require('crypto');
const jwt = require('../modules/jwt');


exports.signin =  async(req,res)=>{
    const {email, password} = req.body;

    try {
        // request data null 값 확인
        if (!email || !password)
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

        // 아이디 존재 확인
        if (await User.checkUser(email) === false)
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER));

        const user = await User.signin(email, password);
        // 비밀번호 확인
        if (user === false)
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.MISS_MATCH_PW));

        // jwt
        const {token, _} = await jwt.sign(user[0]);

        // 성공
        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.LOGIN_SUCCESS, {accessToken: token}));
    } catch(err){
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, err.message));
        throw err;
    }
};

exports.apply = async (req, res) => {
    const groupIdx = req.params.groupIdx;
    const userIdx = req.userIdx;
    //const status = 2; // 디폴트가 2가 아니면 2를 넣어준다.
    const {part,phoneNumber} = req.body;
    try {
        //  //null 값 확인
        // if (!groupIdx || userIdx || part || phoneNumber)
        //     return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

        
    
        const idx = await Group.apply(groupIdx,userIdx,part,phoneNumber);
        
        if (idx === -1)
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, responseMessage.DB_ERROR));

        //성공
        return res.status(statusCode.CREATED).send(util.success(statusCode.CREATED, responseMessage.apply_SUCCESS, {
            userIdx : userIdx, groupIdx: groupIdx, userPart: part }));
    } catch(err){
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, err.message));
        throw err;
    }
};





exports.getMyGroupList =  async(req,res)=>{

    const userIdx = req.userIdx;
    const waitQuery = req.query;
    try {
    
        
            const groupInfo = await Group.callMygroupInfo(userIdx); //그룹에 대한 이름, 이미지
            const groupUserCnt = await Group.callMygroupUserCnt(userIdx); // 그룹에 대한 유저 수
            const groupPostCnt = await Group.callMygroupPostCnt(userIdx); // 그룹에 대한 게시물 수
            const myGroupList = await Group.getMyGroupList(userIdx,waitQuery);

            
            for(let i =0; i< myGroupList.length; i++) {
               
                const myGroupUserCnt = await Group.getGroupUserCnt(myGroupList[i].groupIdx);
                const myGroupPostCnt = await Group.getGroupPostCnt(myGroupList[i].groupIdx);
                myGroupList[i].UserCount = myGroupUserCnt;
                myGroupList[i].PostCount = myGroupPostCnt;
                
            }
            
    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CALL_GROUP_LIST, {
            myGroupList
        }));
    } catch(err){
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, err.message));
        throw err;
    }

};