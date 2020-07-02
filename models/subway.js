const pool = require('../modules/pool');
const table = 'SUBWAY_TB';

const subway = {
    getSubway :async() => {
        const query = `SELECT * FROM ${table}`;
    }

}

module.exports = subway;