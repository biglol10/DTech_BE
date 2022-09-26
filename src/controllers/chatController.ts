import asyncHandler from '@src/middleware/async';
import {
	queryExecutorResult,
	queryExecutorResult2,
	queryExecutorResultProcedure,
} from '@src/util/queryExecutorResult';
import ErrorResponse from '@src/util/errorResponse';
import { generateUID, LinkArrFetchMetadata } from '@src/util/customFunc';
import conn from '@src/dbConn/dbConnection';
import { IOSocket, io } from '@src/app';
import { getConnectedUser } from '@src/util/memoryStorage';

import { axiosFetchMetadata } from './utilsController';

export const getPrivateChatList = asyncHandler(async (req, res, next) => {
	const { fromUID, toUID } = req.body;
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

	const resultChatList = await queryExecutorResultProcedure('ReadChatList', [fromUID, convId]);

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
	const { chatRoomId } = req.body;

	const sql = `SELECT T1.MESSAGE_ID, T1.FROM_USERNAME, T1.TO_USERNAME, T1.MESSAGE_TEXT, T1.IMG_LIST, T1.LINK_LIST, T1.SENT_DATETIME, T1.USER_UID, T2.USER_NM, T2.USER_TITLE, T1.CONVERSATION_ID FROM USER_CHAT AS T1 INNER JOIN USER AS T2 ON T1.USER_UID = T2.USER_UID WHERE CONVERSATION_ID = '${chatRoomId}' ORDER BY SENT_DATETIME;`;

	const resultChatList = await queryExecutorResult2(sql, [chatRoomId]);

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
		chatRoomId,
	});
});

// unused
export const savePrivateChat = asyncHandler(async (req, res, next) => {
	const { chatMessage, imgList, linkList, userUID, convId } = req.body;

	const message_uuid = `message_${generateUID()}`;
	const sql = `INSERT INTO USER_CHAT VALUES('${message_uuid}', NULL, NULL, ${conn.escape(
		chatMessage,
	)}, ${conn.escape(imgList)}, ${conn.escape(linkList)}, SYSDATE(), '${userUID}', '${convId}')`;

	const insertResult = await queryExecutorResult(sql);

	if (insertResult.status === 'error') {
		return next(new ErrorResponse('채팅값 넣는 작업이 실패했습니다', 400));
	}

	const chatSql = `SELECT MESSAGE_ID, FROM_USERNAME, TO_USERNAME, MESSAGE_TEXT, IMG_LIST, LINK_LIST, SENT_DATETIME, USER_UID, CONVERSATION_ID FROM USER_CHAT WHERE CONVERSATION_ID = '${convId}' ORDER BY SENT_DATETIME`;
	const resultChatList = await queryExecutorResult(chatSql);

	if (resultChatList.status === 'error') {
		return next(new ErrorResponse('서버에서 에러가 발생했습니다', 400));
	}

	return res.status(200).json({
		result: 'success',
		chatList: resultChatList.queryResult,
		convId,
	});
});

export const getUnReadChatNoti = asyncHandler(async (req, res, next) => {
	// const { fromUID } = req.body;
	const { fromUID } = req.query;

	// const sql = `SELECT T1.CONVERSATION_ID, T1.USER_UID FROM GROUP_MEMBER AS T1 WHERE T1.USER_UID != '${fromUID}' AND EXISTS (SELECT * FROM GROUP_MEMBER AS T2 WHERE T2.USER_UID = '${fromUID}' AND T2.UNREAD_MESSAGE = 1 AND T1.CONVERSATION_ID = T2.CONVERSATION_ID);`;
	const sql = `SELECT T1.CONVERSATION_ID, T1.USER_UID FROM GROUP_MEMBER AS T1 WHERE T1.USER_UID != ? AND EXISTS (SELECT * FROM GROUP_MEMBER AS T2 WHERE T2.USER_UID = ? AND T2.UNREAD_MESSAGE = 1 AND T1.CONVERSATION_ID = T2.CONVERSATION_ID);`;

	const resultUnReadList = await queryExecutorResult2(sql, [
		fromUID as string,
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

export const uploadChatImg = asyncHandler(async (req, res, next) => {
	return res.status(200).json({
		bodyObj: req.body,
	});
});

export const createChatGroup = asyncHandler(async (req, res, next) => {
	const { chatGroupName, userParticipants, senderUID } = req.body;

	const chat_uuid = `conv_group_${generateUID()}`;

	const converstationSql = `INSERT INTO CONVERSATION VALUES (?, ?, ?)`;
	const converstationArg = [chat_uuid, chatGroupName, '단체톡'];

	const result1 = await queryExecutorResult2(converstationSql, converstationArg);

	if (result1.status === 'error') {
		return next(new ErrorResponse('채팅방을 만들지 못했습니다', 500));
	}

	const insertAction = userParticipants.map(
		async (singleUser: { USER_UID: string; USER_ID: string }) => {
			const groupMemberSql = `INSERT INTO GROUP_MEMBER VALUES ('${chat_uuid}', '${singleUser.USER_UID}', SYSDATE(), 0);`;
			await queryExecutorResult2(groupMemberSql, []);
		},
	);

	await Promise.all(insertAction);

	if (IOSocket) {
		IOSocket.emit('chatGroupCreateSuccess', {
			chatGroupUID: chat_uuid,
			chatGroupName,
			chatCnt: userParticipants.length,
		});
	}

	if (io) {
		userParticipants.map((singleUser: { USER_UID: string; USER_ID: string }) => {
			if (senderUID !== singleUser.USER_ID) {
				const connUser = getConnectedUser(singleUser.USER_ID);
				if (connUser) {
					io.to(connUser.socketId).emit('chatGroupCreateSuccess', {
						chatGroupUID: chat_uuid,
						chatGroupName,
						chatCnt: userParticipants.length,
					});
				}
			}
		});
	}

	return res.status(200).json({
		result: 'success',
		chatGroupUID: chat_uuid,
	});
});

export const getChatGroups = asyncHandler(async (req, res, next) => {
	const currentUser = req.query.currentUser as string;
	const sql = `SELECT T1.CONVERSATION_ID, T1.CONVERSATION_NAME, (SELECT COUNT(*) FROM GROUP_MEMBER AS T3 WHERE T1.CONVERSATION_ID = T3.CONVERSATION_ID) AS CNT FROM CONVERSATION AS T1 WHERE EXISTS (SELECT * FROM GROUP_MEMBER AS T2 WHERE T1.CONVERSATION_ID = T2.CONVERSATION_ID AND T2.USER_UID = ? ORDER BY T2.JOINED_DATE DESC) AND T1.GUBUN = '단체톡';`;
	const result = await queryExecutorResult2(sql, [currentUser]);

	if (result.status === 'error') {
		return next(new ErrorResponse('채팅방 목록을 가져오지 못했습니다', 500));
	}

	return res.status(200).json({
		result: 'success',
		chatGroups: result.queryResult,
	});
});
