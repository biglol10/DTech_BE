import asyncHandler from '@src/middleware/async';
import { queryExecutorResult, queryExecutorResultProcedure } from '@src/util/queryExecutorResult';
import ErrorResponse from '@src/util/errorResponse';
import { generateUID } from '@src/util/customFunc';
import conn from '@src/dbConn/dbConnection';

export const getPrivateChatList = asyncHandler(async (req, res, next) => {
	const { fromUID, toUID } = req.body;
	const chat_uuid = `conv_private_${generateUID()}`;

	const resultChatId = await queryExecutorResultProcedure('CheckAndReturnConvId', [
		fromUID,
		toUID,
		chat_uuid,
	]);

	const convId = resultChatId.queryResult[0][0].ConvId;
	if (resultChatId.status === 'error' || !convId) {
		return next(new ErrorResponse('서버에서 에러가 발생했습니다', 400));
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

export const savePrivateChat = asyncHandler(async (req, res, next) => {
	const { chatMessage, imgList, linkList, userUID, convId } = req.body;

	const message_uuid = `message_${generateUID()}`;
	const sql = `INSERT INTO USER_CHAT VALUES('${message_uuid}', NULL, NULL, ${conn.escape(
		chatMessage,
	)}, '[]', '[]', SYSDATE(), '${userUID}', '${convId}')`;

	console.log('came here 0');
	console.log(sql);

	const insertResult = await queryExecutorResult(sql);

	if (insertResult.status === 'error') {
		return next(new ErrorResponse('채팅값 넣는 작업이 실패했습니다', 400));
	}

	console.log('came here 1');

	const chatSql = `SELECT MESSAGE_ID, FROM_USERNAME, TO_USERNAME, MESSAGE_TEXT, IMG_LIST, LINK_LIST, SENT_DATETIME, USER_UID, CONVERSATION_ID FROM USER_CHAT WHERE CONVERSATION_ID = ${convId} ORDER BY SENT_DATETIME`;

	console.log('came here 2');
	console.log(chatSql);
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
