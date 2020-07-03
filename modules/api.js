/* request query = query?=고기집 */ 
const request = require('request');
const {client_id, client_secret} = require('../config/naverAPI');
const {seoulKey} = require('../config/seoulAPI');
module.exports = {
  mapFindAPI: (req,res) =>{
    return new Promise((resolve, reject) =>{
      const api_url = 'https://openapi.naver.com/v1/search/local.json?query=' + encodeURI(req.query.query); // json 결과
      const options = {
        url: api_url,
        headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
      };

      request.get(options, async(error,response,body)=>{
        const responseData = (JSON.parse(response.body).items).map(it => {
          // link, category, description, telephone 추가 가능
          return {placeId:it.mapx+it.mapy, title:it.title, address:it.address, roadAddress:it.roadAddress,mapx:it.mapx, mapy:it.mapy, link: it.link};
        });
        // let result = [];
        // responseData.forEach(it => {
        //   result.push({placeId:it.mapx+it.mapy, title:it.title, address:it.address, roadAddress:it.roadAddress,mapx:it.mapx, mapy:it.mapy})
        // });
        
        if(error){
          console.log('naver request API error : '+ error);
          reject(error);
        }
        else {
          resolve(responseData);
        }
      })
    })
  },
  subWayApi: (req,res) => {
    return new Promise((resolve, reject) => {
      const api_uri = 'http://openapi.seoul.go.kr:8088/'+seoulKey+'/json/SearchSTNBySubwayLineInfo/0/999/%20/%20/';

      request.get(api_uri, async(error, response,body)=>{
        let responseData = response.body;
        console.log(responseData);
        if(error){
          console.log('subway request API error : ' + error);
          reject(error);
        }
        else{
          resolve(responseData)
        }
      })
    })
  }
}
