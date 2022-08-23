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

/** @설명: 개인메시지 보내는 함수. INSERT 문까지 프로시저에 넣으면 '이 앞뒤에 들어가는 문제가 발생하여 INSERT문만 따로 빼냄 */
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

	const messageTransactionAfter = await queryExecutorResultProcedure('MessageTransactionAfter', [
		userUID,
		convId,
	]);

	const { status, queryResult } = messageTransactionAfter;

	if (status === 'error') {
		return {
			result: 'error',
		};
	}

	return {
		result: 'success',
		chatList: queryResult,
		convId,
	};
};
