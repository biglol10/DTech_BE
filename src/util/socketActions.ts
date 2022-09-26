import { generateUID, LinkArrFetchMetadata } from '@src/util/customFunc';
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
	toUserId: string,
): Promise<errResult | succResult> => {
	const message_uuid = `message_${generateUID()}`;

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
		return {
			result: 'error',
		};
	}

	const messageTransactionAfter = await queryExecutorResultProcedure('MessageTransactionAfter', [
		userUID,
		convId,
	]);

	let { status, queryResult } = messageTransactionAfter;

	queryResult = await LinkArrFetchMetadata(queryResult);

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

export const sendGroupMessageFunction = async (
	chatMessage: string,
	userUID: string,
	convId: string,
	imgList: string,
	linkList: string,
): Promise<errResult | succResult> => {
	const message_uuid = `message_${generateUID()}`;

	const insertResult = await queryExecutorResultProcedure('SendGroupChat', [
		message_uuid,
		chatMessage,
		imgList,
		linkList,
		userUID,
		convId,
	]);

	if (insertResult.status === 'error') {
		return {
			result: 'error',
		};
	}

	const messageTransactionAfter = await queryExecutorResultProcedure('MessageTransactionAfter', [
		userUID,
		convId,
	]);

	let { status, queryResult } = messageTransactionAfter;

	queryResult = await LinkArrFetchMetadata(queryResult);

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
