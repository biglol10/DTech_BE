import asyncHandler from '@src/middleware/async';
import { queryExecutorResult2 } from '@src/util/queryExecutorResult';
import { uploadImg } from '@src/util/s3Connect';

export const setSubmitBoard = asyncHandler(async (req, res, next) => {
	let { type, title, uuid, tech, content, formData } = req.body.postData;
	const imgArr = req.body.imgArr;

	if (tech === '') {
		tech = null;
	}

	const sql = `INSERT INTO BOARD VALUES
	(NEXTVAL(\'BOARD\'),?,current_timestamp(),
	?,?,?)`;
	const resultData: any = await queryExecutorResult2(sql, [uuid, title, content, tech]);

	if (resultData.status === 'success') {
		const sql2 = `select BOARD_CD, BOARD_TITLE from BOARD
		where BOARD_UID=?
		order by BOARD_DATE DESC
		limit 1;`;
		const resultData2 = await queryExecutorResult2(sql2, [uuid]);

		if (resultData2.status === 'success' && imgArr.length > 0) {
			let sql3 = 'INSERT INTO BOARD_URL VALUES ';
			const s3Url = `https://dcx-tech.s3.ap-northeast-2.amazonaws.com/`;
			for (let i = 0; i < imgArr.length; i++) {
				sql3 += `('${resultData2.queryResult[0].BOARD_CD}',${i + 1},'image','${
					s3Url + imgArr[i]
				}'),`;
			}
			sql3 = sql3.slice(0, -1);
			const resultData3 = await queryExecutorResult2(sql3, []);

			if (resultData3.status === 'success') {
				return res.status(200).json({
					result: 'success',
					resultData: resultData2,
				});
			} else {
				return res.status(401).json({
					resultData3,
					message: 'query3 execute failed',
					status: resultData3.status || 'err from node',
				});
			}
		} else {
			return res.status(401).json({
				resultData2,
				message: 'query2 execute failed',
				status: resultData2.status || 'err from node',
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

// export const setSubmitBoard2 = async (req: any, res: any, postData: any, imgArr?: any) => {
// 	let { type, title, uuid, tech, content } = postData;
// 	if (tech === '') {
// 		tech = null;
// 	}

// 	const sql = `INSERT INTO BOARD VALUES
// 	(NEXTVAL(\'BOARD\'),?,current_timestamp(),
// 	?,?,?)`;
// 	const resultData: any = await queryExecutorResult2(sql, [uuid, title, content, tech]);

// 	if (resultData.status === 'success') {
// 		const sql2 = `select BOARD_CD, BOARD_TITLE from BOARD
// 		where BOARD_UID=?
// 		order by BOARD_DATE DESC
// 		limit 1;`;
// 		const resultData2 = await queryExecutorResult2(sql2, [uuid]);
// 		// console.log(resultData2);

// 		if (resultData2.status === 'success' && imgArr.length > 0) {
// 			let sql3 = 'INSERT INTO BOARD_URL VALUES ';
// 			const s3Url = `https://dcx-tech.s3.ap-northeast-2.amazonaws.com/`;
// 			for (let i = 0; i < imgArr.length; i++) {
// 				sql3 += `('${resultData2.queryResult[0].BOARD_CD}',${i + 1},'image','${
// 					s3Url + imgArr[i]
// 				}'),`;
// 			}
// 			sql3 = sql3.slice(0, -1);
// 			const resultData3 = await queryExecutorResult2(sql3, []);

// 			return resultData3;
// 		} else {
// 			return resultData2;
// 		}
// 	} else {
// 		return resultData;
// 	}
// };

export const setBoardLike = asyncHandler(async (req, res, next) => {
	let sql = '';
	if (req.body.like === true) {
		sql = `INSERT INTO BOARD_COMMENT VALUES(NEXTVAL('CMNT'),
    ?,'like', ?, null,null,current_timestamp()); 
    `;
	} else {
		sql = `delete from BOARD_COMMENT 
    WHERE BOARD_CD=? 
    AND CMNT_UID=?;
    `;
	}

	const resultData = await queryExecutorResult2(sql, [req.body.id, req.body.userUID]);

	if (resultData.status === 'success') {
		let sql2 =
			'UPDATE BOARD SET LIKE_CNT = LIKE_CNT' +
			(req.body.like ? ' + ' : ' - ') +
			'1 WHERE BOARD_CD=?';
		const resultData2 = await queryExecutorResult2(sql2, [req.body.id]);

		console.log(resultData2);
		if (resultData2.status === 'success') {
			return res.status(200).json({
				resultData2,
			});
		} else {
			return res.status(401).json({
				resultData,
				message: 'query2 execute failed',
			});
		}
	} else {
		return res.status(401).json({
			resultData,
			message: 'query execute failed',
		});
	}
});

export const getBoardList = asyncHandler(async (req, res, next) => {
	let sqlParam = [req.body.uuid];
	let sql = `SELECT B.*, COUNT(C.CMNT_CD) AS LIKED
	FROM BOARD B LEFT JOIN 
	(SELECT * FROM BOARD_COMMENT WHERE CMNT_UID=? AND CMNT_TYPE='like') C
	ON B.BOARD_CD = C.BOARD_CD`;
	if (req.body.brdId !== undefined) {
		sql += ' WHERE B.BOARD_CD=?';
		sqlParam.push(req.body.brdId);
	}
	sql += ' GROUP BY B.BOARD_CD';
	const resultData = await queryExecutorResult2(sql, sqlParam);

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

export const getComments = asyncHandler(async (req, res, next) => {
	console.log('getComments');
	// console.log(req.body);

	const reqParam = [req.body.brdId];
	const sql = 'SELECT * FROM BOARD_COMMENT WHERE BOARD_CD = ?';
	const resultData = await queryExecutorResult2(sql, reqParam);

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

export const setComment = asyncHandler(async (req, res, next) => {
	console.log('setComment');
	console.log(req.body);
	const reqParam = [req.body.brdId, req.body.uuid, req.body.commentArea];
	const sql = `INSERT INTO BOARD_COMMENT VALUES
	(NEXTVAL('CMNT'),?,'comment',?,
	?,null,current_timestamp())
	`;

	const resultData = await queryExecutorResult2(sql, reqParam);

	if (resultData.status === 'success') {
		const reqParam2 = [req.body.brdId];
		const sql2 = 'SELECT * FROM BOARD_COMMENT WHERE BOARD_CD = ?';
		const resultData2 = await queryExecutorResult2(sql2, reqParam2);
		if (resultData2.status === 'success') {
			return res.status(200).json({
				resultData: resultData2,
			});
		} else {
			return res.status(401).json({
				resultData: resultData2,
				message: 'query2 execute failed',
			});
		}
	} else {
		return res.status(401).json({
			resultData,
			message: 'query execute failed',
		});
	}
});
