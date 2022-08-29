import { Socket } from 'socket.io';

module.exports = function (socket: Socket) {
	socket.on('textChangeNotification', ({ sendingUser }) => {
		socket.broadcast.emit('textChangeNotification', sendingUser);
	});
};
