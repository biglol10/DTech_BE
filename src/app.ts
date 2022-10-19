/* eslint-disable @typescript-eslint/no-var-requires */
import express, { Request, Response } from 'express';

import cors from 'cors';
import errorHandler from '@src/middleware/error';
import { sendPrivateMessageFunction, sendGroupMessageFunction } from './util/socketActions';
import {
	usersSocket,
	addUser,
	removeUser,
	getConnectedUser,
	addUserRoom,
	removeUserRoom,
} from './util/memoryStorage';
import { app, server, io } from './util/serverInstance';

import { authRoute, dashboardRoute, chatRoute, utilsRoute, boardRoute } from './routes';

const PORT = 3066;

io.on('connection', (socket) => {
	const interval = setInterval(() => {
		socket.emit('connectedUsers', {
			users: usersSocket,
		});
	}, 10000);

	socket.on('connectUser', async ({ userId }: { userId: string }) => {
		await addUser(userId, socket.id);

		socket.emit('connectedUsers', {
			users: usersSocket,
		});
	});

	socket.on('disconnect', async () => {
		await removeUser(socket.id);
		clearInterval(interval);
	});

	socket.on(
		'sendPrivateMessage',
		async ({
			chatMessage,
			userUID,
			convId,
			imgList,
			linkList,
			toUserId,
			toUserUID,
		}: {
			[keys: string]: string;
		}) => {
			const sendResult = await sendPrivateMessageFunction(
				chatMessage,
				userUID,
				convId,
				imgList,
				linkList,
				toUserId,
			);

			if (sendResult.result === 'success' && toUserId) {
				const user = getConnectedUser(toUserId);
				if (user) {
					io.to(user.socketId).emit('newMessageReceived', {
						chatListSocket: sendResult.chatList,
						convIdSocket: sendResult.convId,
						fromUID: userUID,
					});

					setTimeout(() => {
						io.to(user.socketId).emit('newMessageReceivedSidebar', {
							fromUID: userUID,
						});
					}, 1000);
				}

				socket.emit('messageSendSuccess', {
					chatListSocket: sendResult.chatList,
					convIdSocket: sendResult.convId,
					toUserUID,
				});
			}
		},
	);

	socket.on(
		'sendGroupMessage',
		async ({ chatMessage, userUID, convId, imgList, linkList }: { [keys: string]: string }) => {
			const sendResult = await sendGroupMessageFunction(
				chatMessage,
				userUID,
				convId,
				imgList,
				linkList,
			);

			if (sendResult.result === 'success') {
				socket.emit('messageGroupSendSuccess', {
					chatListSocket: sendResult.chatList,
				});

				socket.broadcast.to(convId).emit('newMessageGroupReceived', {
					chatListSocket: sendResult.chatList,
					fromUID: userUID,
					convId,
				});

				setTimeout(() => {
					sendResult.usersToNotify &&
						sendResult.usersToNotify.map((userString) => {
							const user = getConnectedUser(userString);
							if (user) {
								io.to(user.socketId).emit('newMessageGroupReceivedSidebar', {
									fromUID: convId,
								});
							}
						});
				}, 1000);
			}
		},
	);

	socket.on(
		'joinRoom',
		async ({ roomID, joinedUser }: { roomID: string; joinedUser: string }) => {
			await addUserRoom(joinedUser, socket.id, roomID);

			socket.join(roomID);
		},
	);

	socket.on('leaveRoom', async ({ roomID }: { roomID: string; joinedUser: string }) => {
		await removeUserRoom(socket.id, roomID);

		socket.leave(roomID);
	});

	require('./util/socketDefinition')(socket);
});

// Body parser
app.use(express.json());

app.set('trust proxy', true);

const corsOptions = {
	origin: ['http://localhost:3065', 'https://dev.example.com', 'https://dtech-app.vercel.app'],
	credentials: true,
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
// app.use(cors(corsOptions));
app.use(cors({ credentials: true }));

app.use('/api/auth', authRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/chat', chatRoute);
app.use('/api/utils', utilsRoute);
app.use('/api/board', boardRoute);

app.use(errorHandler);

server.listen(PORT, () => {
	console.log(`
  ################################################
  🛡️  Server listening on port: ${PORT}
  ################################################
`);
});

module.exports = app;
