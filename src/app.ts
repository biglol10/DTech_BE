/* eslint-disable @typescript-eslint/no-var-requires */
import express, { Request, Response } from 'express';

import { authRoute, dashboardRoute, utilsRoute, chatRoute, boardRoute, infoRoute } from '@src/routes/index';

import cors from 'cors';
import errorHandler from '@src/middleware/error';
import dtechCommonProp from '@src/util/dtechCommon';
import { app, server, io } from './util/serverInstance';

const PORT = process.env.PORT || 3066;

io.on('connection', (socket) => {
	const interval = setInterval(() => {
		socket.emit('connectedUsers', {
			users: dtechCommonProp.getUsersSocket,
		});
	}, 10000);

	socket.on('connectUser', async ({ userId }: { userId: string }) => {
		dtechCommonProp.userSocket = { userId, socketId: socket.id };

		socket.emit('connectedUsers', {
			users: dtechCommonProp.getUsersSocket,
		});
	});

	socket.on('disconnect', async () => {
		dtechCommonProp.removeUserSocket = socket.id;
		clearInterval(interval);
	});

	socket.on('joinRoom', async ({ roomID, joinedUser }: { roomID: string; joinedUser: string }) => {
		dtechCommonProp.userSocketRoom = {
			userId: joinedUser,
			socketId: socket.id,
			roomId: roomID,
		};

		socket.join(roomID);
	});

	socket.on('leaveRoom', async ({ roomID }: { roomID: string; joinedUser: string }) => {
		dtechCommonProp.removeUserSocketRoom = { socketId: socket.id, roomId: roomID };

		socket.leave(roomID);
	});

	socket.on('privateMessageSentSuccess', ({ fromUserId, toUserId }: { [key: string]: string }) => {
		const targetUser = dtechCommonProp.getConnectedUser(toUserId);
		if (targetUser) {
			io.to(targetUser.socketId).emit('newMessageReceived', {
				fromUID: fromUserId,
			});
			setTimeout(() => {
				io.to(targetUser.socketId).emit('newMessageReceivedSidebar', {
					fromUID: fromUserId,
				});
			}, 1000);
		}
	});

	socket.on('groupMessageSentSuccess', ({ convId, usersToNotify }: { convId: string; usersToNotify: string[] }) => {
		socket.broadcast.to(convId).emit('newMessageGroupReceived', {
			convId,
		});

		setTimeout(() => {
			usersToNotify &&
				usersToNotify.map((userString) => {
					const user = dtechCommonProp.getConnectedUser(userString);
					if (user) {
						io.to(user.socketId).emit('newMessageGroupReceivedSidebar', {
							fromUID: convId,
						});
					}
				});
		}, 1000);
	});

	require('./util/socketDefinition')(socket);
});

// Body parser
app.use(express.json());

const setCache = function (req, res, next) {
	const period = 60 * 5;

	// you only want to cache for GET requests
	if (req.method == 'GET') {
		res.set('Cache-control', `public, max-age=${period}`);
	} else {
		// for the other requests set strict no caching parameters
		res.set('Cache-control', `no-store`);
	}
	next();
};

app.use(setCache);

app.set('trust proxy', true);

const corsOptions = {
	origin: ['http://localhost:3065', 'https://dev.example.com', 'https://dtech-app.vercel.app'],
	// credentials: true,
};

app.get('/welcome', (req: Request, res: Response) => {
	return res.send('welcome!');
});

app.get('/hello', (req: Request, res: Response) => {
	return res.status(200).json({
		data: 'hihi',
	});
});

// Enable CORS
app.use(cors(corsOptions));
// app.use(cors({ credentials: true }));

app.use('/api/auth', authRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/chat', chatRoute);
app.use('/api/utils', utilsRoute);
app.use('/api/board', boardRoute);
app.use('/api/info', infoRoute);

app.use(errorHandler);

server.listen(PORT, () => {
	console.log(`
  ################################################
  🛡️  Server listening on port: ${PORT}
  ################################################
`);
});

module.exports = app;
