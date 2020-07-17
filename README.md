
# 🐷 placepic :Cutty Kitty Server
<img style="border: 1px solid black !important; border-radius:20px;" src="https://avatars2.githubusercontent.com/u/67547341?s=200&v=4" width="200px" />

<br />

**![piccrevv_bedge](https://img.shields.io/badge/placepic-piccrevv-F65C6C)**
![npm_bedge](https://img.shields.io/badge/npm-6.13.7-blue)
![node_bedge](https://img.shields.io/badge/node-13.11.0-brightgreen)



* <b> SOPT 26th APPJAM - Team **placepic** </b>
    
* <b> 프로젝트 기간: 2020.06.28 ~ 2020.07.18 </b>

* <b> [Notion - 기능 명세서, API 진척도](https://www.notion.so/Server-Part-d88e5572975b4d4d89128f1bfc10b780) </b>

<br>


## 📍 placepic service

 <b>우리들끼리 공유하는 최애 장소, 플레이스픽 </b>

 플레이스픽은 신뢰있는 커뮤니티 기반의 장소 정보 공유 플랫폼입니다. 

 **Service key Feature**
  * Exploration - 쉽고, 빠르게 원하는 장소를 탐색

  * Discovery - 가보고 싶은 장소를 발견할 수 있어야함

  * Interaction - 상호작용, 소통할 수 있는 공간

<br />

## ✍ Core value

### 🔝 App Jam Goal
* 우리가 쓸 수 있고, 쓰고 싶은 서비스 구현

### 👥우리가 추구하는 가치
* 사용자 경험에 대한 집착 
* 자기주도성
* 린 스타트업 정신
* PRIDE✨

<br />

## 🖥 Code convention
 
- **git branch**

```
master
   |
   |--- kdk
   |--- junyup
   |--- cyh
```

- **git commit message rule** 
```
[Feat] 기능 추가

[Fix] 버그 수정

[Refactor] 리팩토링

[Chore] 간단한 수정

[Delete] 기능 삭제

[Docs] 문서
```

<br />

## 👪 Communication

### [PlacePic - Kanban board](https://github.com/orgs/placepic/projects/1)

### [Server - Kanban board](https://github.com/placepic/placepic_server/projects/1)

### [SERVER API 문서](https://github.com/placepic/placepic_server/wiki)

### Notion

### SLACK


<br />

## 🤝Team Role
  
> 💻 place pig's server developer 

| **🙋 [김동관](https://github.com/dk-master)** | **🙋‍ [최영훈](https://github.com/dudgns3tp)** | **🙋‍ [홍준엽](https://github.com/junyup0319)** |
| :---: |:---:| :---:|
| [![FVCproductions](https://avatars3.githubusercontent.com/u/61861809?s=460&u=f834deb744174671e44ea2b579f8bfe22e280de2&v=4)]()    | [![FVCproductions](https://avatars1.githubusercontent.com/u/40652160?s=460&u=9cd767fc9ae0adc0948fec0fb7c4fe126a64ffae&v=4)]() | [![FVCproductions](https://avatars2.githubusercontent.com/u/39546874?s=460&u=049590b1c31828d01c5555b4c34d1c414a0711ba&v=4)]()  |
| 서버 개발자 | 서버 리드 개발자| 서버 개발자|
|  **![placepic_bedge](https://img.shields.io/badge/placepic-sprint1-F65C6C)** | **![placepic_bedge](https://img.shields.io/badge/placepic-sprint1-F65C6C)** | **![placepic_bedge](https://img.shields.io/badge/placepic-sprint1-F65C6C)** |
|rdb설계  <br /> 배포 환경 구축 <br /> 회원가입, 로그인 <br /> 그룹 인증 관리 <br /> 그룹 리스트 조회  <br />|rdb설계 <br /> 배포 환경 구축 <br /> place 업로드 <br /> 지하철 API <br /> 네이버 지도 API |rdb설계 <br /> 배포 환경 구축 <br /> 장소 검색 필터링 <br /> 장소 검색 API <br /> 장소 검색 sorting|
| **![placepic_bedge](https://img.shields.io/badge/placepic-sprint2-363636)**| **![placepic_bedge](https://img.shields.io/badge/placepic-sprint2-363636)**| **![placepic_bedge](https://img.shields.io/badge/placepic-sprint2-363636)**|
|마이페이지 & 랭킹|좋아요 & 북마크 Interaction|마이페이지 & 랭킹| 
  
<br />

## ✔ Main Function
- Map
    - 네이버 지도 API를 이용하여 사용자에게 신뢰성 있는 정보를 제공.
    
- Search
    - 카테고리, keyword, 장소 정보, 지하철역명을 통해 사용자가 원하는 데이터를 **filltering**, **sorting** 
    
- Interaction
   - 좋아요, 북마크, 랭킹 기능을 통해 그룹간 **Interaction**

<br />

## 📖 Dependencies 

![dependencies](https://github.com/placepic/placepic_server/blob/master/public/images/dependencies.png?raw=true)

<br />


## 📚 Library

- [Node.js](https://nodejs.org/ko/) : 런타임 환경
- [Express](https://expressjs.com/ko/) : NodeJs Framework
- [NPM](https://www.npmjs.com/) : NodeJS package manager
- [PM2](https://pm2.io/) : NodeJS process manager
- [Mocha](https://mochajs.org/)  : 테스트 러너 프레임워크
- [Lodash](https://lodash.com/) : 자바스크립트 유틸리티 라이브러리

## 🔥 ERD

![ERD](https://github.com/placepic/placepic_server/blob/master/public/images/dependencies_final.png?raw=true)

<br />


## 🏗 Architecture

![Architecture](https://github.com/placepic/placepic_server/blob/master/public/images/placepic%20architecture.PNG?raw=true)
