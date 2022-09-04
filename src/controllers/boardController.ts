import asyncHandler from '@src/middleware/async';
import { queryExecutorResult, queryExecutorResult2 } from '@src/util/queryExecutorResult';
import { uploadImg } from '@src/util/s3Connect';

export const setSubmitBoard = asyncHandler(async (req, res, next) => {
	let { type, title, uuid, tech, content, formData } = req.body;
	if (tech === '') {
		tech = null;
	}

	const sql = `INSERT INTO BOARD VALUES
	(NEXTVAL(\'BOARD\'),?,current_timestamp(),
	?,?,?)`;
	const resultData: any = await queryExecutorResult2(sql, [uuid, title, content, tech]);

	if (resultData.status === 'success') {
		const sql2 = `select BOARD_CD, BOARD_TITLE from BOARD 
		where USER_UID=?
		order by BDATE DESC
		limit 1;`;
		const resultData2 = await queryExecutorResult2(sql2, [uuid]);

		if (resultData2.status === 'success') {
			return res.status(200).json({
				result: 'success',
				resultData: resultData2,
			});
		} else {
			return res.status(401).json({
				resultData,
				message: 'query2 execute failed',
				status: resultData.status || 'err from node',
			});
		}
	} else {
		return res.status(401).json({
			resultData,
			message: 'query execute failed',
			status: resultData.status || 'err from node',
		});
	}
});

export const setBoardImage = asyncHandler(async (req, res, next) => {
	// console.log('setBoardImg');
	// console.log(req);
	uploadImg(req, res, 'img', 'board/');
});

export const setBoardLike = asyncHandler(async (req, res, next) => {
	let sql = '';
	if (req.body.like === true) {
		sql = `INSERT INTO BOARD_COMMENT VALUES(NEXTVAL('CMNT'),
    '${req.body.id}','like',
    (select USER_UID from USER where USER_ID=?),
    null,null,current_timestamp()); 
    `;
	} else {
		sql = `delete from BOARD_COMMENT 
    WHERE BOARD_CD='${req.body.id}' 
    AND USER_UID=(SELECT USER_UID FROM USER WHERE USER_ID=?);
    `;
	}

	const resultData = await queryExecutorResult2(sql, [req.body.userId]);
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

	const resultData = await queryExecutorResult2(sql);
	const sql2 = 'select BOARD_CD,URL_ORDER,URL_ADDR as url from BOARD_URL where URL_TYPE="image"';
	const resultImg = await queryExecutorResult2(sql2);

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
