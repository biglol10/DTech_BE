import express, { Request, Response, NextFunction } from 'express';

import conn from '@src/dbConn/dbConnection';
import {
	authRoute,
	dashboardRoute,
	testRoute,
	utilsRoute,
	chatRoute,
	boardRoute,
} from '@src/routes/index';

import cors from 'cors';
import errorHandler from '@src/middleware/error';
import http from 'http';
import { Server } from 'socket.io';
import { sendPrivateMessageFunction, sendGroupMessageFunction } from './util/socketActions';
import {
	usersSocket,
	addUser,
	removeUser,
	usersSocket2,
	addUser2,
	removeUser2,
	getConnectedUser,
	addUserRoom,
	removeUserRoom,
	getConnectedUserRoom,
	getAllConnectedUsersRoom,
} from './util/memoryStorage';
import ioInstance from './util/socketIO';

const app = express();

const server = http.createServer(app);
// const io = new Server(server);
export const io = ioInstance(server);
export let IOSocket: any = null;

const PORT = 3066;

io.on('connection', (socket) => {
	console.log(`a new user connected with socketId of ${socket.id}`);

	IOSocket = socket;

	const interval = setInterval(() => {
		socket.emit('connectedUsers', {
			// users: usersSocket,
			users: usersSocket,
		});
	}, 10000);

	socket.on('connectUser', async ({ userId }: { userId: string }) => {
		await addUser(userId, socket.id);

		socket.emit('connectedUsers', {
			// users: usersSocket,
			users: usersSocket,
		});
	});

	socket.on('disconnect', async (obj) => {
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

	socket.on(
		'leaveRoom',
		async ({ roomID, joinedUser }: { roomID: string; joinedUser: string }) => {
			await removeUserRoom(socket.id, roomID);

			socket.leave(roomID);
		},
	);

	require('./util/socketDefinition')(socket);

	// return io;

	// socket.on('textChangeNotification', ({ sendingUser }) => {
	// 	socket.broadcast.emit('textChangeNotification', sendingUser);
	// });
});

// conn.connect(function (err) {
// 	if (err) {
// 		console.log(err);
// 		throw err;
// 	}
// 	console.log('Connected!!');
// });

// Body parser
app.use(express.json());

app.set('trust proxy', true);

const corsOptions = {
	origin: ['http://localhost:3065', 'https://dev.example.com'],
	credentials: true,
};

// Enable CORS
app.use(cors(corsOptions));

app.use('/api/auth', authRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/testApi', testRoute);
app.use('/api/utils', utilsRoute);
app.use('/api/board', boardRoute);
app.use('/api/chat', chatRoute);

app.use(errorHandler);

app.get('/welcome', (req: Request, res: Response, next: NextFunction) => {
	res.send('welcome!');
});

server.listen(PORT, () => {
	console.log(`
  ################################################
  🛡️  Server listening on port: ${PORT}
  ################################################
`);
});
