const pool = require('../modules/pool');
const crypto = require('crypto');
const table = 'USER_TB';

const user = {
    signup: async (email,password,salt,userName,userBirth,gender) => {
        const fields = 'email,password,salt,userName,userBirth,gender';
        const questions = `?, ?, ?, ?, ?, ?`;
        const values = [email,password,salt,userName,userBirth,gender];
        const query = `INSERT INTO ${table}(${fields}) VALUES(${questions})`;
        try {
            const result = await pool.queryParamArr(query, values);
            const insertId = result.insertId;
            return insertId;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('signup ERROR : ', err.errno , err.code);
                return -1;
            }
            console.log('signup ERROR : ', err);
            throw err;
        }
    },
    checkUser: async (email) => {
        const query = `SELECT * FROM ${table} WHERE email = "${email}";`;
        try{
            const result = await pool.queryParam(query);
            if(result.length > 0) return true;
            else return false;
        } catch(err){
            console.log('checkUser ERROR : ', err);
            throw err;
        }
    },
    signin: async (email, password) => {
        const query = `SELECT * FROM ${table} WHERE email = "${email}";`
        try{
            const result = await pool.queryParam(query);
            const hashedPassword = await crypto.pbkdf2Sync(password, result[0].salt, 1, 32, 'sha512').toString('hex');

            if(result[0].password === hashedPassword) return result;
            else return false;
        } catch(err){
            console.log('signin ERROR : ', err);
            throw err;
        }
    },

    
    getUserById : async (id) => {
        const query = `SELECT * FROM ${table} WHERE id = "${id}";`
        try{
            const result = await pool.queryParam(query);
            return result[0];
        } catch(err){
            console.log('getUserById ERROR : ', err);
            throw err;
        }
    }
}

module.exports = user;