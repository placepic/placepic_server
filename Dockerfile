# FROM 은 docker 이미지를 생성할때 Docker Hub에 있는 해당 이미지를 기반으로 이미지를 생성하겠다 라고 선언해주는 부분
FROM node:12

MAINTAINER dudgns <yeonghun0327@gmail.com>
#  WORKDIR 는 RUN, CMD 명령어가 실행될 디렉토리를 설정하는 부분
WORKDIR /usr/src/app
# COPY package.json lock-json 파일 모두 이미지에 추가
COPY package*.json ./

RUN npm install
RUN npm install -g pm2
# 모두 추가
COPY . .
EXPOSE 3000
# docker run을 실행할때 사용할 명령어
CMD ["pm2-runtime", "start", "./bin/www"]