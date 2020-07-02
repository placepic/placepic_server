const pool = require('../modules/pool');
const subwayTable = 'SUBWAY_TB';

const subway = {
    getSubway: async () => {
        try {
            const query = `SELECT * FROM ${subwayTable}`;
            const subwayDto = await pool.queryParam(query);
            return subwayDto;
        }catch(err){
            console.log('subway error : ',err);
            throw err;
        }
    }
}

module.exports = subway;