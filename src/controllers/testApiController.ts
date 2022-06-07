import asyncHandler from '@src/middleware/async';
import queryExecutorResult from '@src/util/queryExecutorResult';

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
	// const resultData = await waitingTime();

	res.status(200).json({
		success: true,
		data: 'sampleData',
		resultData: '## this data is from server ##',
	});
});

// export const testApiToFront = asyncHandler(async (req:))
