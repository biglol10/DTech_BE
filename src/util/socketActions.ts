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
