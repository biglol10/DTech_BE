/** ****************************************************************************************
 * : Medata 저장소 @@NotUsed
 ********************************************************************************************/
interface metadataStorageObj {
	status: string;
	metadata_title: string | undefined;
	metadata_description: string | undefined;
	metadata_image: string | undefined;
}

interface metadataStorage {
	[name: string]: metadataStorageObj;
}

const metadataStorage: metadataStorage = {};

/** ****************************************************************************************
 * : 유저 소캣 저장소
 ********************************************************************************************/

interface IUserSocket {
	userId: string;
	socketId: string;
	roomId?: string;
}

const usersSocket: Array<IUserSocket> = [];

const addUser = async (userId: string, socketId: string) => {
	// check if we have a user connected with this userId
	const user = usersSocket.find((user) => user.userId === userId);

	// if there is a user in users array, which means user is connected already then check socketId
	if (user && user.socketId === socketId) {
		return usersSocket;
	}
	// if socketId is not equal, remove and create new (when you refresh this makes sure there are no duplicates, so user has a unique socketID)
	else {
		if (user && user.socketId !== socketId) {
			await removeUser(user.socketId);
		}
		const newUser = { userId, socketId };
		usersSocket.push(newUser);
		return usersSocket;
	}
};

const addUserRoom = async (userId: string, socketId: string, roomId: string) => {
	// check if we have a user connected with this userId and roomId
	const user = usersSocket.find((user) => user.userId === userId && user.roomId === roomId);

	if (user && user.socketId === socketId) {
		return usersSocket;
	} else {
		if (user && user.socketId !== socketId) {
			await removeUserRoom(user.socketId, roomId);
		}
		const newUserRoom = { userId, socketId, roomId };
		usersSocket.push(newUserRoom);
		return usersSocket;
	}
};

const removeUser = async (socketId: string) => {
	const indexOf = usersSocket.map((user) => user.socketId).indexOf(socketId);
	indexOf > -1 && (await usersSocket.splice(indexOf, 1));
	return;
};

const removeUserRoom = async (socketId: string, roomId: string) => {
	let indexOf: null | number = null;
	usersSocket.map((user, idx) => {
		if (user.socketId === socketId && user.roomId === roomId) {
			indexOf = idx;
		}
	});
	indexOf !== null && (await usersSocket.splice(indexOf, 1));
	return;
};

interface IUserSocket2 {
	[id: string]: string;
}

const usersSocket2: IUserSocket2 = {};

const addUser2 = (userId: string, socketId: string) => {
	const userSocketValue = userId ? usersSocket2[userId] : null;

	if (userSocketValue && userSocketValue === socketId) {
		return usersSocket2;
	} else if (userSocketValue && userSocketValue !== socketId) {
		removeUser2(userSocketValue);
		usersSocket2[userId] = socketId;
		return usersSocket2;
	}
};

const removeUser2 = (socketId: string) => {
	Object.keys(usersSocket2).map((item) => {
		if (usersSocket2[item] === socketId) delete usersSocket2[item];
	});
	return;
};

const getConnectedUser = (userId: string) => {
	const user = usersSocket.find((item) => item.userId === userId);
	return user;
};

const getConnectedUserRoom = (userId: string, roomID: string) => {
	const user = usersSocket.find((item) => item.userId === userId && item.roomId === roomID);
	return user;
};

const getAllConnectedUsersRoom = (roomID: string) => {
	const arr = usersSocket.filter((item) => item.roomId === roomID);
	return arr;
};

export {
	metadataStorage,
	usersSocket,
	addUser,
	removeUser,
	usersSocket2,
	addUser2,
	removeUser2,
	addUserRoom,
	removeUserRoom,
	getConnectedUser,
	getConnectedUserRoom,
	getAllConnectedUsersRoom,
};
