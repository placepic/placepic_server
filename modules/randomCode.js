const moment = require('moment');
module.exports ={
    randCode:() =>{
        var unixTime= parseInt(moment().format('X')).toString(16);
        var groupCode ="";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < 5; i++ ) // 5자리 랜덤코드 생성
            groupCode += possible.charAt(Math.floor(Math.random() * possible.length));
        return groupCode+unixTime; // 5자리 랜덤코드와 현재 시간 합
    },
    emailCode:()=>{
        var unixTime = parseInt(moment().format('X')).toString(16);
        var randCode = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < 6; i++ ) //  6자리 랜덤코드 생성
            randCode += possible.charAt(Math.floor(Math.random() * possible.length));
        return unixTime + randCode; // 6자리 랜덤코드와 현재 시간 합
    }
    //testing에 필요한 전화번호 랜덤값 return
    ,randNumber:()=>{
        var min = Math.ceil(min);
        var max = Math.floor(max);
        var phoneNumber = "010";
        for(i = 0; i < 4; i++)
            phoneNumber +=  Math.floor(Math.random() * 10); 
        for(i = 0; i < 4; i++)
            phoneNumber +=  Math.floor(Math.random() * 10); 
        return phoneNumber;
    }
}