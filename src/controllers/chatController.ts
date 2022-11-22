import { io } from '@src/util/serverInstance';
import asyncHandler from '@src/middleware/async';
import { generateUID, LinkArrFetchMetadata } from '@src/util/customFunc';
import ErrorResponse from '@src/util/errorResponse';
import { getConnectedUser } from '@src/util/memoryStorage';
import {
	queryExecutorResult,
	queryExecutorResult2,
	queryExecutorResultProcedure,
} from '@src/util/queryExecutorResult';

export const getPrivateChatList = asyncHandler(async (req, res, next) => {
	const { fromUID, toUID, lastMsgId } = req.body;
	const chat_uuid = `conv_private_${generateUID()}`;

	const resultChatId = await queryExecutorResultProcedure('CheckAndReturnConvId', [
		fromUID,
		toUID,
		chat_uuid,
	]);

	const convId = resultChatId.queryResult[0].ConvId;
	if (resultChatId.status === 'error' || !convId) {
		return next(new ErrorResponse('서버에서 에러가 발생했습니다', 400));
	}

	const prObj = {
		prName: !lastMsgId ? 'ReadChatList' : 'ReadChatListDateBetween',
		prParam: !lastMsgId ? [fromUID, convId] : [fromUID, convId, lastMsgId],
	};

	const resultChatList = await queryExecutorResultProcedure(prObj.prName, prObj.prParam);

	if (resultChatList.status === 'error') {
		return next(new ErrorResponse('서버에서 에러가 발생했습니다', 400));
	}

	resultChatList.queryResult = await LinkArrFetchMetadata(resultChatList.queryResult);
	resultChatList.queryResult.map((item: any, idx: number) => {
		resultChatList.queryResult[idx].IMG_LIST = JSON.parse(
			resultChatList.queryResult[idx].IMG_LIST,
		);
	});

	return res.status(200).json({
		result: 'success',
		chatList: resultChatList.queryResult,
		convId,
		fromUID,
		toUID,
	});
});

export const getGroupChatList = asyncHandler(async (req, res, next) => {
	const { chatRoomId, readingUser, lastMsgId } = req.body;

	const prObj = {
		prName: !lastMsgId ? 'ReadGroupChatList' : 'ReadChatListDateBetween',
		prParam: !lastMsgId ? [readingUser, chatRoomId] : [readingUser, chatRoomId, lastMsgId],
	};

	const resultChatList = await queryExecutorResultProcedure(prObj.prName, prObj.prParam);

	if (resultChatList.status === 'error') {
		return next(new ErrorResponse('서버에서 에러가 발생했습니다', 400));
	}

	resultChatList.queryResult = await LinkArrFetchMetadata(resultChatList.queryResult);
	resultChatList.queryResult.map((item: any, idx: number) => {
		resultChatList.queryResult[idx].IMG_LIST = JSON.parse(
			resultChatList.queryResult[idx].IMG_LIST,
		);
	});

	const groupChatUsersSql =
		'SELECT T2.USER_UID, T2.USER_ID, T2.USER_NM, T2.USER_TITLE, T2.USER_IMG_URL FROM GROUP_MEMBER AS T1 INNER JOIN USER AS T2 ON T1.USER_UID = T2.USER_UID WHERE CONVERSATION_ID = ?';

	const groupChatUsersResult = await queryExecutorResult2(groupChatUsersSql, [chatRoomId]);

	if (groupChatUsersResult.status === 'error') {
		return next(new ErrorResponse('서버에서 에러가 발생했습니다', 400));
	}

	return res.status(200).json({
		result: 'success',
		chatList: resultChatList.queryResult,
		chatRoomId,
		groupChatUsers: groupChatUsersResult.queryResult,
	});
});

export const getUnReadChatNoti = asyncHandler(async (req, res, next) => {
	const { fromUID } = req.body;

	const resultUnReadList = await queryExecutorResultProcedure('GetUnReadChatNoti', [
		fromUID as string,
	]);

	if (resultUnReadList.status === 'error') {
		return next(new ErrorResponse('서버에서 에러가 발생했습니다', 500));
	}

	return res.status(200).json({
		result: 'success',
		unReadList: resultUnReadList.queryResult,
	});
});

export const createChatGroup = asyncHandler(async (req, res, next) => {
	const { chatGroupName, userParticipants } = req.body;

	const chat_uuid = `conv_group_${generateUID()}`;

	const converstationSql = `INSERT INTO CONVERSATION VALUES (?, ?, ?)`;
	const converstationArg = [chat_uuid, chatGroupName, '단체톡'];

	const result1 = await queryExecutorResult2(converstationSql, converstationArg);

	if (result1.status === 'error') {
		return next(new ErrorResponse('채팅방을 만들지 못했습니다', 500));
	}

	const insertAction = userParticipants.map(
		(singleUser: { USER_UID: string; USER_ID: string }) => {
			const groupMemberSql = `INSERT INTO GROUP_MEMBER VALUES ('${chat_uuid}', '${singleUser.USER_UID}', SYSDATE(), 0);`;
			queryExecutorResult2(groupMemberSql, []);
		},
	);

	Promise.all(insertAction);

	if (io) {
		userParticipants.map((singleUser: { USER_UID: string; USER_ID: string }) => {
			const connUser = getConnectedUser(singleUser.USER_ID);
			if (connUser) {
				io.to(connUser.socketId).emit('chatGroupCreateSuccess', {
					chatGroupUID: chat_uuid,
					chatGroupName,
					chatCnt: userParticipants.length,
				});
			}
		});
	}

	return res.status(200).json({
		result: 'success',
		chatGroupUID: chat_uuid,
	});
});

export const getChatGroups = asyncHandler(async (req, res, next) => {
	const { currentUser } = req.body;
	const sql = `SELECT T1.CONVERSATION_ID, T1.CONVERSATION_NAME, (SELECT COUNT(*) FROM GROUP_MEMBER AS T3 WHERE T1.CONVERSATION_ID = T3.CONVERSATION_ID) AS CNT FROM CONVERSATION AS T1 WHERE EXISTS (SELECT * FROM GROUP_MEMBER AS T2 WHERE T1.CONVERSATION_ID = T2.CONVERSATION_ID AND T2.USER_UID = '${currentUser}' ORDER BY T2.JOINED_DATE DESC) AND T1.GUBUN = '단체톡';`;
	const result = await queryExecutorResult(sql);

	if (result.status === 'error') {
		return next(new ErrorResponse('채팅방 목록을 가져오지 못했습니다', 500));
	}

	return res.status(200).json({
		result: 'success',
		chatGroups: result.queryResult,
	});
});

export const uploadChatImg = asyncHandler(async (req, res) => {
	return res.status(200).json({
		bodyObj: req.body,
	});
});

export const insertPrivateChatMessage = asyncHandler(async (req, res, next) => {
	const message_uuid = `message_${generateUID()}`;
	const { chatMessage, userUID, convId, imgList, linkList, toUserId } = req.body;

	const insertResult = await queryExecutorResultProcedure('SendUserPrivateChat', [
		message_uuid,
		chatMessage,
		imgList,
		linkList,
		userUID,
		convId,
		toUserId,
	]);

	if (insertResult.status === 'error') {
		return next(new ErrorResponse('메시지를 보내지 못했습니다', 400));
	}

	const messageTransactionAfter = await queryExecutorResultProcedure('MessageTransactionAfter', [
		userUID,
		convId,
		message_uuid,
	]);

	let { queryResult } = messageTransactionAfter;
	const { status } = messageTransactionAfter;

	queryResult = await LinkArrFetchMetadata(queryResult);

	if (status === 'error') {
		return next(new ErrorResponse('메시지 저장 후 정상작업을 수행하지 못했습니다', 400));
	}

	if (io) {
		const user = getConnectedUser(toUserId);
		if (user) {
			io.to(user.socketId).emit('newMessageReceived', {
				fromUID: userUID,
			});
			setTimeout(() => {
				io.to(user.socketId).emit('newMessageReceivedSidebar', {
					fromUID: userUID,
				});
			}, 1000);
		}
	}

	return res.status(200).json({
		result: 'success',
		newChat: queryResult,
		convId,
	});
});

export const insertGroupChatMessage = asyncHandler(async (req, res, next) => {
	const message_uuid = `message_${generateUID()}`;

	const { chatMessage, userUID, convId, imgList, linkList } = req.body;

	const insertResult = await queryExecutorResultProcedure('SendGroupChat', [
		message_uuid,
		chatMessage,
		imgList,
		linkList,
		userUID,
		convId,
	]);

	if (insertResult.status === 'error') {
		return next(new ErrorResponse('메시지를 보내지 못했습니다', 400));
	}

	const messageTransactionAfter = await queryExecutorResultProcedure('MessageTransactionAfter', [
		userUID,
		convId,
		message_uuid,
	]);

	let { queryResult } = messageTransactionAfter;
	const { status } = messageTransactionAfter;

	queryResult = await LinkArrFetchMetadata(queryResult);

	if (status === 'error') {
		return next(new ErrorResponse('메시지 저장 후 정상작업을 수행하지 못했습니다', 400));
	}

	const usersToNotify = insertResult.queryResult.map((item: any) => item.USER_ID);

	// if (io) {
	// 	usersToNotify.map((userString) => {
	// 		const user = getConnectedUser(userString);
	// 		if (user) {
	// 			io.to(user.socketId).emit('newMessageGroupReceivedSidebar', {
	// 				fromUID: convId,
	// 			});
	// 		}
	// 	});
	// }

	return res.status(200).json({
		result: 'success',
		newChat: queryResult,
		convId,
		usersToNotify,
	});
});
