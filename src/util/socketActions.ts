import { generateUID } from '@src/util/customFunc';
import conn from '@src/dbConn/dbConnection';
import { queryExecutorResult, queryExecutorResultProcedure } from '@src/util/queryExecutorResult';

interface errResult {
	result: 'error';
}

interface succResult {
	result: 'success';
	chatList: any;
	convId: string;
}

export const sendPrivateMessageFunction = async (
	chatMessage: string,
	userUID: string,
	convId: string,
	imgList: string,
	linkList: string,
): Promise<errResult | succResult> => {
	const message_uuid = `message_${generateUID()}`;
	const sql = `INSERT INTO USER_CHAT VALUES('${message_uuid}', NULL, NULL, ${conn.escape(
		chatMessage,
	)}, ${conn.escape(imgList)}, ${conn.escape(linkList)}, SYSDATE(), '${userUID}', '${convId}')`;

	const insertResult = await queryExecutorResult(sql);

	if (insertResult.status === 'error') {
		return {
			result: 'error',
		};
	}

	const chatSql = `SELECT MESSAGE_ID, FROM_USERNAME, TO_USERNAME, MESSAGE_TEXT, IMG_LIST, LINK_LIST, SENT_DATETIME, USER_UID, CONVERSATION_ID FROM USER_CHAT WHERE CONVERSATION_ID = '${convId}' ORDER BY SENT_DATETIME`;
	const resultChatList = await queryExecutorResult(chatSql);

	if (resultChatList.status === 'error') {
		return {
			result: 'error',
		};
	}

	return {
		result: 'success',
		chatList: resultChatList.queryResult,
		convId,
	};
};
