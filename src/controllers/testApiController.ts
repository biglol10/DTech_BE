import { Request } from 'express';
import asyncHandler from '@src/middleware/async';
import queryExecutorResult from '@src/util/queryExecutorResult';
import { IGetUserAuthInfoRequest } from '@src/util/commTypes';

export const getTestApi = asyncHandler(async (req, res, next) => {
	const sql = 'select * from ttable';
	// const sql = 'select * from sampleadsfsadf';
	// const sql = `INSERT INTO sample VALUES ('3', 'insertedVal1', 'insertedVal2')`;

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

export const getTestApi2 = asyncHandler(async (req, res, next) => {
	const resultData = await waitingTime();

	res.status(200).json({
		success: true,
		data: 'sampleData',
		resultData,
	});
});

export const postTestApiWithLogin = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res, next) => {
		const resultData = await waitingTime();

		res.status(200).json({
			success: true,
			data: 'Post login is successful',
			resultData,
		});
	},
);

// export const testApiToFront = asyncHandler(async (req:))
