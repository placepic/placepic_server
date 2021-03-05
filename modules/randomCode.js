const moment = require('moment');
module.exports = {
    randCode: () => {
        return new Promise((resolve, reject) => {
            let groupCode = '';
            const possible = '0123456789';
            for (
                let i = 0;
                i < 4;
                i++ // 5자리 랜덤코드 생성
            )
                groupCode += possible.charAt(Math.floor(Math.random() * possible.length));
            resolve(groupCode); // 5자리 랜덤코드와 현재 시간 합
        });
    },
    emailCode: () => {
        let unixTime = parseInt(moment().format('X')).toString(16);
        let randCode = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (
            let i = 0;
            i < 6;
            i++ //  6자리 랜덤코드 생성
        )
            randCode += possible.charAt(Math.floor(Math.random() * possible.length));
        return unixTime + randCode; // 6자리 랜덤코드와 현재 시간 합
    },
    randNumber: () => {
        let min = Math.ceil(min);
        let max = Math.floor(max);
        let phoneNumber = '010';
        for (i = 0; i < 4; i++) phoneNumber += Math.floor(Math.random() * 10);
        for (i = 0; i < 4; i++) phoneNumber += Math.floor(Math.random() * 10);
        return phoneNumber;
    },
};
