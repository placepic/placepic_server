const pool = require('../modules/pool');
const crypto = require('crypto');
const table = 'USER_TB';
const moment = require('moment');
const api = require('../modules/api');

const user = {
    signup: async (email, password, salt, userName, userBirth, gender) => {
        const nowUnixTime = parseInt(moment().format('X'));
        console.log(nowUnixTime);
        const fields = 'email,password,salt,userName,userBirth,gender,userCreatedAt';
        const questions = `?, ?, ?, ?, ?, ?, ?`;
        const values = [email, password, salt, userName, userBirth, gender, nowUnixTime];
        const query = `INSERT INTO ${table}(${fields}) VALUES(${questions})`;
        try {
            const result = await pool.queryParamArr(query, values);
            const insertId = result.insertId;
            return insertId;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('signup ERROR : ', err.errno, err.code);
                return -1;
            }
            console.log('signup ERROR : ', err);
            throw err;
        }
    },
    checkUser: async (email) => {
        const query = `SELECT * FROM ${table} WHERE email = "${email}";`;
        try {
            const result = await pool.queryParam(query);
            if (result.length > 0) return true;
            else return false;
        } catch (err) {
            console.log('checkUser ERROR : ', err);
            throw err;
        }
    },
    signin: async (email, password) => {
        const query = `SELECT * FROM ${table} WHERE email = "${email}";`;
        try {
            const result = await pool.queryParam(query);
            const hashedPassword = await crypto.pbkdf2Sync(password, result[0].salt, 1, 32, 'sha512').toString('hex');

            if (result[0].password === hashedPassword) return result;
            else {
                return false;
            }
        } catch (err) {
            console.log('sigin in error : ', err);
            throw err;
        }
    },

    getUserById: async (id) => {
        const query = `SELECT * FROM ${table} WHERE id = "${id}";`;
        try {
            const result = await pool.queryParam(query);
            return result[0];
        } catch (err) {
            console.log('getUserById ERROR : ', err);
            throw err;
        }
    },

    getUserImage: async (userIdx, img) => {
        const editStatusApplyUser = `UPDATE USER_TB SET ${img} WHERE userIdx = ${userIdx}`;

        try {
            const result = await pool.queryParam(editStatusApplyUser);
            return result;
        } catch (err) {
            console.log('editStatusApplyUser ERROR : ', err);
            throw err;
        }
    },

    /** SP3 회원가입 & 로그인 */
    checkUserPhoneNumber: async (phoneNumber) => {
        // TODO phoneNumber_ 를 phoneNumber로 변경하기
        const query = `SELECT * FROM ${table} WHERE phoneNumber_ = ${phoneNumber};`;
        try {
            const result = await pool.queryParam(query);
            if (result.length > 0) return true;
            else return false;
        } catch (err) {
            console.log('checkUser ERROR : ', err);
            throw err;
        }
    },

    sendMessage: async (phoneNumber, certificationNumber) => {
        try {
            // TODO 인증번호 발송 로직
            // 메시지 발송
            const result = await api.sendMessage(phoneNumber, certificationNumber);
            return result.body;
        } catch (e) {
            throw e;
        }
    },

    signUpSP3: async (phoneNumber, salt, certificationNumber) => {
        // DB 저장
        const nowUnixTime = parseInt(moment().format('X'));

        // TODO phoneNumber_ 를 phoneNumber로 변경하기
        const fields = 'phoneNumber_, salt, userCreatedAt, certificationNumber';
        const questions = `?, ?, ?, ?`;
        const values = [phoneNumber, salt, nowUnixTime, certificationNumber];
        const query = `INSERT INTO ${table}(${fields}) VALUES(${questions})`;

        try {
            const result = await pool.queryParamArr(query, values);
            const insertId = result.insertId;
            return insertId;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('signup ERROR : ', err.errno, err.code);
                // return -1;
                // controller에서 -1 처리를 안해주는데...? -> 일단 throw 되게 해놓음
            }
            console.log('signup ERROR : ', err);
            throw err;
        }
    },
    updateCertificationNumber: async (phoneNumber, certificationNumber) => {
        // DB UPDATE
        // TODO phoneNumber_ 를 phoneNumber로 변경하기
        const query = `UPDATE ${table} SET certificationNumber = "${certificationNumber}" WHERE phoneNumber_ = "${phoneNumber}"`;

        try {
            const result = await pool.queryParam(query);
            const insertId = result.insertId;
            return insertId;
        } catch (err) {
            console.log('DB update error!');
            throw err;
        }
    },
    signInSP3: async (phoneNumber, certificationNumber) => {
        // TODO phoneNumber_ 를 phoneNumber로 변경하기
        const query = `SELECT * FROM ${table} WHERE phoneNumber_ = ${phoneNumber}`;
        try {
            const result = await pool.queryParam(query);
            if (result[0].certificationNumber !== certificationNumber) return false;
            return result;
        } catch (e) {
            throw e;
        }
    },
};

module.exports = user;
