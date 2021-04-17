/* request query = query?=고기집 */
const request = require('request');
const crypto = require('crypto');
const moment = require('moment');
const axios = require('axios');

const { client_id, client_secret } = require('../config/naverAPI.js');
const ncp = require('../config/naverCloudPlatform.js');
const { seoulKey } = require('../config/seoulAPI.js');

module.exports = {
    mapFindAPI: (query) => {
        return new Promise((resolve, reject) => {
            const api_url =
                'https://openapi.naver.com/v1/search/local.json?query=' +
                encodeURI(query) +
                '&display=5'; // json 결과
            const options = {
                url: api_url,
                headers: { 'X-Naver-Client-Id': client_id, 'X-Naver-Client-Secret': client_secret },
            };

            request.get(options, async (error, response, body) => {
                const responseData = JSON.parse(response.body).items.map((it) => {
                    // link, category, description, telephone 추가 가능
                    return {
                        placeId: it.mapx + it.mapy,
                        title: it.title,
                        address: it.address,
                        roadAddress: it.roadAddress,
                        mapx: it.mapx,
                        mapy: it.mapy,
                        link: it.link,
                    };
                });
                // let result = [];
                // responseData.forEach(it => {
                //   result.push({placeId:it.mapx+it.mapy, title:it.title, address:it.address, roadAddress:it.roadAddress,mapx:it.mapx, mapy:it.mapy})
                // });

                if (error) {
                    console.log('naver request API error : ' + error);
                    reject(error);
                } else {
                    resolve(responseData);
                }
            });
        });
    },
    subWayApi: (req, res) => {
        return new Promise((resolve, reject) => {
            const api_uri =
                'http://openapi.seoul.go.kr:8088/' +
                seoulKey +
                '/json/SearchSTNBySubwayLineInfo/0/999/%20/%20/';

            request.get(api_uri, async (error, response, body) => {
                let responseData = response.body;
                if (error) {
                    console.log('subway request API error : ' + error);
                    reject(error);
                } else {
                    resolve(responseData);
                }
            });
        });
    },
    sendMessage: (phoneNumber, certificationNumber) => {
        return new Promise((resolve, reject) => {
            const domain = 'https://sens.apigw.ntruss.com';
            const url = `/sms/v2/services/${ncp.serviceId}/messages`;
            const api_url = domain + url;
            const timestamp = moment().valueOf().toString();
            const signature = crypto
                .createHmac('sha256', ncp.secretKey)
                .update('POST')
                .update(' ')
                .update(url)
                .update('\n')
                .update(timestamp)
                .update('\n')
                .update(ncp.accessKey)
                .digest('base64');

            const options = {
                json: true,
                uri: api_url,
                headers: {
                    'Content-type': 'application/json; charset=utf-8',
                    'x-ncp-apigw-timestamp': timestamp,
                    'x-ncp-iam-access-key': ncp.accessKey,
                    'x-ncp-apigw-signature-v2': signature,
                },
                body: {
                    type: 'SMS',
                    contentType: 'COMM',
                    countryCode: '82',
                    from: ncp.callingNumber,
                    content: `[placepic]\n Login code: ${certificationNumber}`,
                    messages: [
                        {
                            to: phoneNumber,
                        },
                    ],
                },
            };

            request.post(options, (error, response, body) => {
                if (error) {
                    console.log('NCP message API error : ' + error);
                    reject(error);
                }
                resolve(response);
            });
        });
    },
};
