let responseMessage = require('../modules/responseMessage');
let statusCode = require('../modules/statusCode');
let util = require('../modules/util');
let User = require('../models/user');
const crypto = require('crypto');
const jwt = require('../modules/jwt');
const random = require('../modules/randomCode');

module.exports = {
    checkEmail: async (req, res) => {
        const email = req.body.email;
        if (await User.checkUser(email)) {
            console.log('이미 존재하는 이메일 입니다.');
            return res
                .status(statusCode.BAD_REQUEST)
                .send(util.fail(statusCode.BAD_REQUEST, responseMessage.ALREADY_ID));
        }
        console.log('사용 가능한 이메일 입니다.');
        return res.status(statusCode.OK).send(
            util.success(statusCode.OK, responseMessage.POSSIBLE_ID, {
                email,
            })
        );
    },
    signup: async (req, res) => {
        const { email, password, userName, userBirth, gender } = req.body;
        try {
            // null 값 확인
            if (!email || !password || !userName || !userBirth || !(gender + 1)) {
                console.log('값이 다 들어가지 않았습니다.');
                return res
                    .status(statusCode.BAD_REQUEST)
                    .send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
            }
            // already Email
            if (await User.checkUser(email)) {
                console.log('이미 존재하는 이메일 입니다.');
                return res
                    .status(statusCode.BAD_REQUEST)
                    .send(util.fail(statusCode.BAD_REQUEST, responseMessage.ALREADY_ID));
            }
            // password hash 해서 salt 값과 같이 저장
            const salt = crypto.randomBytes(32).toString('hex');
            const hashedPassword = crypto.pbkdf2Sync(password, salt, 1, 32, 'sha512').toString('hex');
            const idx = await User.signup(email, hashedPassword, salt, userName, userBirth, gender);
            //성공
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CREATED_USER));
        } catch (err) {
            return res
                .status(statusCode.INTERNAL_SERVER_ERROR)
                .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        }
    },
    signin: async (req, res) => {
        const { email, password } = req.body;

        try {
            // request data null 값 확인
            if (!email || !password) {
                console.log('정확한 값을 입력해주세요.');
                return res
                    .status(statusCode.BAD_REQUEST)
                    .send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
            }

            // 아이디 존재 확인
            if ((await User.checkUser(email)) === false) {
                console.log('이미 이메일이 존재합니다.');
                return res
                    .status(statusCode.BAD_REQUEST)
                    .send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER));
            }

            const user = await User.signin(email, password);
            // 비밀번호 확인
            if (user === false) {
                console.log('비밀번호가 일치하지 않습니다.');
                return res
                    .status(statusCode.BAD_REQUEST)
                    .send(util.fail(statusCode.BAD_REQUEST, responseMessage.MISS_MATCH_PW));
            }
            // jwt
            const { token, _ } = await jwt.sign(user[0]);

            // 성공
            return res.status(statusCode.OK).send(
                util.success(statusCode.OK, responseMessage.LOGIN_SUCCESS, {
                    accessToken: token,
                })
            );
        } catch (err) {
            console.log('로그인 에러 :', err);
            return res
                .status(statusCode.INTERNAL_SERVER_ERROR)
                .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, err.message));
        }
    },

    /** SP3 회원가입 & 로그인 */
    getCertificationNumber: async (req, res) => {
        const { phoneNumber } = req.body;
        // TODO - certificationNumber 생성 변경하기
        // const certificationNumber = random.randCode();
        const certificationNumber = '1111';

        try {
            if (!phoneNumber) {
                console.log('정확한 값을 입력해주세요.');
                return res
                    .status(statusCode.BAD_REQUEST)
                    .send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
            }
            if (await User.checkUserPhoneNumber(phoneNumber)) {
                // 인증번호 초기화
                await User.updateCertificationNumber(phoneNumber, certificationNumber);
            } else {
                // signUp
                // TODO - 암호화 확인! (재로그인시 phoneNumber랑 hashedPhoneNumber랑 비교 불가 문제!)
                // const salt = crypto.randomBytes(32).toString('hex');
                // const hashedPhoneNumber = crypto.pbkdf2Sync(phoneNumber, salt, 1, 32, 'sha512').toString('hex');
                // await User.signUpSP3(hashedPhoneNumber, salt, certificationNumber);
                await User.signUpSP3(phoneNumber, 'salt', certificationNumber);
            }

            // 메시지 발송
            await User.sendMessage(phoneNumber, certificationNumber);
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SEND_MESSAGE_SUCCESS));
        } catch (err) {
            return res
                .status(statusCode.INTERNAL_SERVER_ERROR)
                .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, err.message));
        }
    },
    signInSP3: async (req, res) => {
        const { phoneNumber, certificationNumber } = req.body;
        try {
            if (!phoneNumber || !certificationNumber) {
                console.log('정확한 값을 입력해주세요.');
                return res
                    .status(statusCode.BAD_REQUEST)
                    .send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
            }
            const user = await User.signInSP3(phoneNumber, certificationNumber);
            if (!user) {
                console.log('비밀번호가 일치하지 않습니다.');
                return res
                    .status(statusCode.BAD_REQUEST)
                    .send(util.fail(statusCode.BAD_REQUEST, responseMessage.MISS_MATCH_PW));
            }

            // jwt
            const { token, _ } = await jwt.signSP3(user[0]);

            // 성공
            return res.status(statusCode.OK).send(
                util.success(statusCode.OK, responseMessage.LOGIN_SUCCESS, {
                    accessToken: token,
                })
            );
        } catch (err) {
            return res
                .status(statusCode.INTERNAL_SERVER_ERROR)
                .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, err.message));
        }
    },
};
