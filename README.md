<h1 align="center">DTech App Backend</h1>

<p align="center">
  <img src="https://user-images.githubusercontent.com/46738034/197947114-86c6a4a6-850e-4d4e-b45c-2da9984e942f.png" alt="Project Screenshot" width="100%">
</p>

<!-- Add project description and duration -->
<p align="center">
  <em>:star: Development Period - June 16, 2022 to November 1, 2022</em>
</p>

## About DTech App

**DTech App** is an application designed to facilitate team skill assessment and information sharing. It aims to address situations where team members might have questions but don't know where to ask or when new team members join, and their skill sets or domains are not known, causing frustration. To overcome these challenges, we created [DTech-App](https://dtech-app.vercel.app/), a tool that allows team members to easily check the team's skill status. The app has a structure similar to Slack.

🌐 [Frontend Repository](https://github.com/biglol10/DTech_FE) <br/>
📄 [API Documentation](https://documenter.getpostman.com/view/14863756/2s8YRjptSi)

## Project Features

1. 💻 Absolute Paths
   - Configured absolute paths using tsconfig-paths.
2. 🤖 Authentication
   - User authentication using JWT.
3. 🗂️ Image Upload
   - File upload for images using Multer S3.
4. ↔️ Socket and REST API
   - Implemented real-time personal/group chat using Socket library.
   - Developed REST API using Express.
5. ℹ️ URL Metadata
   - Retrieve URL metadata and store it on the server using Axios and Cheerio.
6. AWS Infrastructure
   - Deployed backend server as a Heroku hobby dyno.
   - Created a new S3 bucket and redefined connections.
   - Updated S3 connection method.
   - Added `next` parameter to ErrorHandler.

## Change Logs

- August 6, 2023:
  - Changed the backend server from AWS EC2 to Heroku hobby dyno.
  - Removed all absolute paths.
  - Created a new S3 bucket and redefined connections.
  - Updated S3 connection method by adding `next` parameter to ErrorHandler.
