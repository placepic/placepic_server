/*
포스트 테스트
기존 사용자 정보를 통해 게시물 업로드 및 전체, 상세, top3 조회
*/
var should = require('should');
var assert = require("assert")
var request = require("supertest");
var expect = require("chai").expect;
var server = require("../app.js");
const baseUrl = require('../config/testServer.json').baseUrl;

describe("게시물 테스트 ->", function () {
    var svr = baseUrl;
    var token, idx, category;
    //기존 사용자 아이디 비밀번호
    var user_data = {
        email: "placepic@google.com",
        password: "1111"
    };
    
    //서버 연결
    before(async function () {
        result = await server.listen()
    });

    //기존 사용자 토큰 삽입
    beforeEach(function (done) {
        request(svr)
            .post("/auth/signin")
            .send(user_data)
            .end(async function (err, res) {
                if (err) return done(err);
                var result = await JSON.parse(res.text);
                token = result.data.accessToken;
                done();
            });
    });
    let {title, address, roadAddress, mapx, mapy, placeReview, categoryIdx, groupIdx, tags, infoTags, subwayIdx} = req.body;
    describe("플레이스 게시물 업로드 테스트", function () {
        it("플레이스  업로드 성공", function (done) {
            request(svr)
                .post("/post")
                .set('Authorization', token)
                .field('image', 'https://sopt26.s3.ap-northeast-2.amazonaws.com/1594543227287.png')
                .field('address', '테스트address')
                .field('postContent', '오늘은 영훈3세가 요리사')
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                });
        });
    });


    describe("게시물 조회 테스트", function () {
        //게시물 조회시 idx, category 저장
        beforeEach(function (done) {
            request(svr)
                .get("/post")
                .set('Authorization', token)
                .end(async function (err, res) {
                    if (err) return done(err);
                    var result = await JSON.parse(res.text);
                    idx = result.data.pidArr[0]._id;
                    category = result.data.pidArr[0].category;
                    done();
                });
        });

        it("전체 게시물 조회 성공", function (done) {
            request(svr)
                .get("/post")
                .set('Authorization', token)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("Top3 게시물 조회 성공", function (done) {
            request(svr)
                .get("/post/top")
                .set('Authorization', token)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("첫번째 게시물의 카테고리 조회 성공", function (done) {
            request(svr)
                .get(`/post/hash?category=${category}`)
                .set('Authorization', token)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("첫번째 게시물 클릭시 조회 성공", function (done) {
            request(svr)
                .get(`/post/detail/${idx}`)
                .set('Authorization', token)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                });
        });
    });

    //서버 연결 해제
    after(function (done) {
        result.close();
        done();
    });
});