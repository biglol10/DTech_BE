import { Server } from 'socket.io';
import http from 'http';

const ioInstance = (server: http.Server) => {
	return new Server(server, {
		cors: {
			origin: [
				'http://localhost:3065',
				'https://dev.example.com',
				'https://dtech-app.vercel.app',
			],
			allowedHeaders: ['my-custom-header'],
			credentials: true,
		},
	});
};

export default ioInstance;
