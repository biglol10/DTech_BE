/** ****************************************************************************************
 * @Name : dtechCommon
 ********************************************************************************************
 * @설명  : MemoryStorage에 있는 것들로 사용하면 가끔 값이 유실되거나 이용하려고 할 때 비어있는 경우(초기화)가 있어 class로 생성
 ********************************************************************************************/

import _ from 'lodash';

interface IUserSocket {
	userId: string;
	socketId: string;
	roomId?: string;
}

class dtechCommonProp {
	static usersSocket: IUserSocket[] = [];

	static get getUsersSocket() {
		return this.usersSocket;
	}

	static set userSocket({ userId, socketId }: { userId: string; socketId: string }) {
		const usersSocketClone: IUserSocket[] = _.cloneDeep(this.usersSocket);
		const user = usersSocketClone.find((user) => user.userId === userId);

		if (user && user.socketId === socketId) return;
		if (user && user.socketId !== socketId) this.removeUserSocket = user.socketId;

		const newUser = { userId, socketId };
		usersSocketClone.push(newUser);

		this.usersSocket = usersSocketClone;
	}

	static set userSocketRoom({ userId, socketId, roomId }: { [key: string]: string }) {
		const usersSocketClone: IUserSocket[] = _.cloneDeep(this.usersSocket);
		const user = usersSocketClone.find((user) => user.userId === userId && user.roomId === roomId);

		if (user && user.socketId === socketId) return;
		if (user && user.socketId !== socketId) this.removeUserSocketRoom = { socketId: user.socketId, roomId };

		const newUserRoom = { userId, socketId, roomId };
		usersSocketClone.push(newUserRoom);

		this.usersSocket = usersSocketClone;
	}

	static set removeUserSocket(socketId: string) {
		const indexOf = this.usersSocket.map((user) => user.socketId).indexOf(socketId);
		indexOf > -1 && this.usersSocket.splice(indexOf, 1);
		return;
	}

	static set removeUserSocketRoom({ socketId, roomId }: { [key: string]: string }) {
		let indexOf: null | number = null;
		this.usersSocket.map((user, idx) => {
			if (user.socketId === socketId && user.roomId === roomId) {
				indexOf = idx;
			}
		});
		indexOf !== null && this.usersSocket.splice(indexOf, 1);
		return;
	}

	static set setUsersSocket(arr) {
		this.usersSocket = arr;
	}

	static getConnectedUser(userId: string) {
		const user = this.usersSocket.find((item) => item.userId === userId);
		return user;
	}

	static getConnectedUserRoom(userId: string, roomID: string) {
		const user = this.usersSocket.find((item) => item.userId === userId && item.roomId === roomID);
		return user;
	}

	static getAllConnectedUsersRoom(roomID: string) {
		const arr = this.usersSocket.filter((item) => item.roomId === roomID);
		return arr;
	}
}

export default dtechCommonProp;
