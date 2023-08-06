<a href="https://dtech-app.vercel.app/">
    <img src="https://dcx-tech.s3.ap-northeast-2.amazonaws.com/chat/96eef3d803cc0f3318f93503b.png" alt="Aimeos logo" title="Aimeos" align="right" height="80" />
</a>

# DTech App Backend

<img width="1720" alt="image" src="https://user-images.githubusercontent.com/46738034/197947114-86c6a4a6-850e-4d4e-b45c-2da9984e942f.png">

<br/>

:star: 개발기간 - 2022/06/16 ~ 2022/11/01

**DTech App**은 팀 스킬 현황파악 및 정보공유가 원활하게 이뤄질 수 있도록 도와주는 앱입니다. <br/> 모르는게 있어 어디에 질문할지 모르거나 팀에 새로운 인원이 많이 들어오면서 누가 어떤 스킬셋이나 도메인을 갖고 있는지 몰라 답답한 상황이 있었을 겁니다. 이를 해결하기 위해 팀 스킬 현황을 파악할 수 있는 [DTech-App](https://dtech-app.vercel.app/)을 만들었으며 Slack 앱과 비슷한 구조를 가지고 있습니다.

🌐 <a href="https://github.com/biglol10/DTech_FE" target="_blank" rel="noopener noreferrer">Frontend 링크</a> <br/>

📄 <a href="https://documenter.getpostman.com/view/14863756/2s8YRjptSi" target="_blank" rel="noopener noreferrer">API문서 링크</a>

## 📝 프로젝트 기능

1. 💻 절대경로
   - tsconfig-paths를 이용한 절대경로 세팅
2. 🤖 인증
   - jwt를 이용한 유저인증
3. 🗂️ 이미지 업로드
   - Multer S3를 이용한 이미지 파일 업로드
4. ↔️ Socket, Rest Api
   - Socket library를 이용한 개인/그룹 채팅 구현
   - Express Rest api 구현
5. ℹ️ Url 메타데이터
   - Axios, cheerio를 이용하여 url 메타데이터 확보 후 서버에 저장
6. 🇦🇼 Infra
   - AWS EC2에 Docker Image 배포
   - ACM, CloudFront를 이용하여 https적용 (https://www.youtube.com/watch?v=WS2n8mkrFaY)
   - CloudWatch를 이용하여 EC2 Alive 시간 조절
