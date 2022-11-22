FROM node:16

# 앱 디렉터리 생성
WORKDIR /usr/src/app

# 앱 의존성 설치
# 가능한 경우(npm@5+) package.json과 package-lock.json을 모두 복사하기 위해
# 와일드카드를 사용
COPY package*.json ./

RUN npm install
# RUN npm run build
# 프로덕션을 위한 코드를 빌드하는 경우
# RUN npm ci --only=production

# 앱 소스 추가
COPY . .

RUN npm run build

EXPOSE 3066
### 채팅 내역 보내고 난 뒤 소캣이 비어있어 상대방은 채팅을 받지 못하는 문제가 있어 우선 dev로 구동
# CMD [ "npm", "run", "startProduction" ]
CMD [ "npm", "run", "dev" ]