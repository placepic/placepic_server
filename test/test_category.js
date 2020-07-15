// category & Keyword & subway
var should = require('should');
var assert = require("assert")
var request = require("supertest");
var expect = require("chai").expect;
var server = require("../app.js");
const baseUrl = require('../config/testServer.json').baseUrl;
describe("마이페이지 테스트 ->", function () {
    let svr = baseUrl;
    let token, categoryIdx = 1;
    //기존 사용자 정보
    var user_data = {
        email: "placepic3@google.com",
        password: "1111"
    };

    //서버 연결
    before(async function () {
        result = await server.listen()
    });

    beforeEach(function (done) {
        //기존 아이디 토큰 삽입
        request(svr)
            .post("/auth/signin")
            .send(user_data)
            .end(async function (err, res) {
                if (err) return done(err);
                let result = JSON.parse(res.text);
                token = await result.data.accessToken;
                done()
            });

    });

    describe("카테고리 키워드 조회", function () {
        it("모든 카테고리 별 키워드 조회", function (done) {
            request(svr)
                .get("/category/all")
                .set('Authorization', token)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("카테고리별 유용한 정보 조회", function (done) {
            request(svr)
                .get(`/tag/default/${categoryIdx}`)
                .set('Authorization', token)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                });
        });
        
        it("키워드 조회", function (done) {
            request(svr)
                .get(`/tag/${categoryIdx}`)
                .set('Authorization', token)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("카테고리별 조회", function (done) {
            request(svr)
                .get(`/category`)
                .set('Authorization', token)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("모든 지하철 조회하기", function (done) {
            request(svr)
                .get("/subway")
                .set('Authorization', token)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                });
        });
    });

    //서버 연결 해제
    after(function () {
        result.close();
    });

});