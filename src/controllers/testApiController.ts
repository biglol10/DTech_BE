import asyncHandler from '../middleware/async';
import { IGetUserAuthInfoRequest } from '../util/commTypes';
import { queryExecutorResult } from '../util/queryExecutorResult';
import conn from '../dbConn/dbConnection';

export const getTestApi = asyncHandler(async (req, res) => {
	const sql = 'select * from TEAM';

	let resultData: any = null;

	resultData = await queryExecutorResult(sql);

	res.status(200).json({ success: true, data: 'sampleData', resultData });
});

const waitingTime = () => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(`The api called and value is ${Math.random() * 100}`);
		}, 2000);
	});
};

export const getTestApi2 = asyncHandler(async (req, res) => {
	const resultData = await waitingTime();

	res.status(200).json({
		success: true,
		data: 'sampleData',
		resultData,
	});
});

export const postTestApiWithLogin = asyncHandler(async (req: IGetUserAuthInfoRequest, res) => {
	const resultData = await waitingTime();

	res.status(200).json({
		success: true,
		data: 'Post login is successful',
		resultData,
	});
});
