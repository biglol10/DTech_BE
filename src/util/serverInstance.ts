import express from 'express';

import { Server } from 'socket.io';
import http from 'http';

const app = express();

const server = http.createServer(app);

const ioInstance = (server: http.Server) => {
	return new Server(server, {
		cors: {
			// origin: [
			// 	'http://localhost:3065',
			// 	'https://dev.example.com',
			// 	'https://dtech-app.vercel.app',
			// 	'http://43.200.191.162:3065',
			// 	'https://dtech-app.vercel.app/dtech',
			// ],
			origin: '*',
			// credentials: true,
		},
	});
};

// ? io를 app.ts에 선언하고 export하면 발생하는 문제:
// 1. npm run dev일 때 이걸 app.ts에서 가져다 쓰는 컨트롤러 쪽에서 문제가 발생하지 않음
// 2. npm run build 후 app.ts에서 io를 가져가면 "TypeError: Router.use() requires a middleware function but got a undefined" 에러 발생
// 3. 따라서 serverInstance.ts에 선언해서 app.ts에서 가져가고 controller에서도 여기에서 가져가기로 변경
// 4. 추측으로는 app.ts에서 객체를 export 하지 않는 것이 중요한듯
const io = ioInstance(server);

export { app, server, io };
