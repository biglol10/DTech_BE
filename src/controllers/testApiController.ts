import asyncHandler from '@src/middleware/async';
import queryExecutorResult from '@src/util/queryExecutorResult';

export const getTestApi = asyncHandler(async (req: any, res: any, next: any) => {
	const sql = 'select * from ttable';
	// const sql = 'select * from sampleadsfsadf';
	// const sql = `INSERT INTO sample VALUES ('3', 'insertedVal1', 'insertedVal2')`;

	let resultData: any = null;

	resultData = await queryExecutorResult(sql);

	res.status(200).json({ success: true, data: 'sampleData', resultData });
});
