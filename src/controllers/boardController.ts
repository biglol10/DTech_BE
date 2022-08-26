import asyncHandler from '@src/middleware/async';
import { queryExecutorResult, queryExecutorResult2 } from '@src/util/queryExecutorResult';

export const setSubmitBoard = asyncHandler(async (req, res, next) => {
	const upload = require('../middleware/multer');
	console.log('setSubmitBoard');
	upload.array('imgs')(req, res, (err: any) => {
		console.log('upload.array');
		// console.log(req);
	});
	// console.log(req.body.content);
	// console.log(req.body.content.imgList[0].imageFile);
	// const sql = `INSERT INTO BOARD VALUES
	// (NEXTVAL(\'BOARD\'),'49989168c6d2f00f1d6a',current_timestamp(),
	// '제목',?,0,0, null,null);
	// `;

	// const resultData = await queryExecutorResult2(sql, [req.body.content.value]);

	// console.log(resultData);
	// if (resultData.status === 'success') {
	// 	// const upload = require('../middleware/multer');
	// } else {
	// 	return res.status(401).json({
	// 		resultData,
	// 		message: 'query execute failed',
	// 	});
	// }
});
export const setBoardLike = asyncHandler(async (req, res, next) => {
	console.log('setBoardLike');
	console.log(req.body);

	let sql = '';
	if (req.body.like === true) {
		sql = `INSERT INTO BOARD_COMMENT VALUES(NEXTVAL('CMNT'),
    '${req.body.id}','like',
    (select USER_UID from USER where USER_ID='${req.body.userId}'),
    null,null,current_timestamp()); 
    `;
	} else {
		sql = `delete from BOARD_COMMENT 
    WHERE BOARD_CD='${req.body.id}' 
    AND USER_UID=(SELECT USER_UID FROM USER WHERE USER_ID='${req.body.userId}');
    `;
	}

	const resultData = await queryExecutorResult(sql);
	console.log(resultData);

	if (resultData.status === 'success') {
		return res.status(200).json({
			resultData,
		});
	} else {
		return res.status(401).json({
			resultData,
			message: 'query execute failed',
		});
	}
});
export const getBoardList = asyncHandler(async (req, res, next) => {
	const sql = `select B.*,
    IFNULL((select COUNT(C.CMNT_CD) 
    from BOARD_COMMENT C
    where B.BOARD_CD = C.BOARD_CD
    and C.CMNT_TYPE = "comment"
    group by B.BOARD_CD
    ),0) as "COMMENTS_CNT",
    IFNULL((select COUNT(C.CMNT_CD)
    from BOARD_COMMENT C
    where B.BOARD_CD = C.BOARD_CD
    and C.CMNT_TYPE = "like"
    group by B.BOARD_CD
    ),0) as "LIKES_CNT"
    from BOARD B`;

	const resultData = await queryExecutorResult(sql);

	const sql2 = 'select BOARD_CD,URL_ORDER,URL as url from BOARD_URL where URL_TYPE="image"';
	const resultImg = await queryExecutorResult(sql2);
	// console.log(resultImg);

	if (resultData.status === 'success' && resultImg.status === 'success') {
		resultData.queryResult.map((board: any) => {
			const tempResult = resultImg.queryResult.filter(
				(img: any) => board.BOARD_CD === img.BOARD_CD,
			);
			board.IMG_LIST = tempResult;
		});

		return res.status(200).json({
			resultData,
		});
	} else {
		return res.status(401).json({
			resultData,
			message: 'query execute failed',
		});
	}
});
