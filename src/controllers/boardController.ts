/* eslint-disable no-useless-escape */
import asyncHandler from '@src/middleware/async';
import { queryExecutorResult2 } from '@src/util/queryExecutorResult';

export const setSubmitBoard = asyncHandler(async (req, res, next) => {
	let { tech } = req.body.postData;

	const { type, title, uuid, content, formData } = req.body.postData;
	const imgArr = req.body.imgArr;

	if (tech === '') {
		tech = null;
	}

	const sql = `INSERT INTO BOARD VALUES
	(NEXTVAL('BOARD'),?,current_timestamp(),
	?,?,?,0,0)`;
	const resultData: any = await queryExecutorResult2(sql, [uuid, title, content, tech]);

	if (resultData.status === 'success') {
		const sql2 = `select BOARD_CD, BOARD_TITLE from BOARD
		where USER_UID=?
		order by BOARD_DATE DESC
		limit 1;`;
		const resultData2 = await queryExecutorResult2(sql2, [uuid]);

		if (resultData2.status === 'success') {
			if (imgArr.length > 0) {
				let sql3 = 'INSERT INTO BOARD_URL VALUES ';
				const s3Url = `https://dcx-tech.s3.ap-northeast-2.amazonaws.com/`;
				for (let i = 0; i < imgArr.length; i++) {
					sql3 += `('${resultData2.queryResult[0].BOARD_CD}',${i + 1},'image','${s3Url + imgArr[i]}'),`;
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
				return res.status(200).json({
					result: 'success',
					resultData: resultData2,
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

export const setBoardLike = asyncHandler(async (req, res, next) => {
	let sql = '';
	if (req.body.like === true) {
		sql = `INSERT INTO BOARD_COMMENT VALUES(NEXTVAL('CMNT'),
    ?,'like', ?, null,null,current_timestamp()); 
    `;
	} else {
		sql = `delete from BOARD_COMMENT 
    WHERE BOARD_CD=? 
    AND USER_UID=?;
    `;
	}

	const resultData = await queryExecutorResult2(sql, [req.body.id, req.body.userUID]);

	if (resultData.status === 'success') {
		const sql2 = 'UPDATE BOARD SET LIKE_CNT = LIKE_CNT' + (req.body.like ? ' + ' : ' - ') + '1 WHERE BOARD_CD=?';
		const resultData2 = await queryExecutorResult2(sql2, [req.body.id]);

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
	const orderType = req.body.orderType ? req.body.orderType : 'new';

	const sqlParam = [req.body.uuid];
	let sql = `SELECT B.*, T.*, COUNT(C.CMNT_CD) as LIKED
	FROM BOARD B LEFT JOIN TECH T
	ON B.TECH_CD = T.TECH_CD
	LEFT OUTER JOIN BOARD_COMMENT C
	ON B.BOARD_CD = C.BOARD_CD
	AND C.USER_UID=?
	AND C.CMNT_TYPE='like'
	WHERE 1=1`;
	if (req.body.brdId !== undefined) {
		sql += ' AND B.BOARD_CD=?';
		sqlParam.push(req.body.brdId);
	}
	if (req.body.filterType !== undefined && req.body.filterType !== null) {
		sql += ' AND B.TECH_CD=?';
		sqlParam.push(req.body.filterType);
	}
	sql += ' GROUP BY B.BOARD_CD ';
	if (orderType === 'new') {
		sql += 'ORDER BY B.BOARD_DATE DESC';
	} else if (orderType === 'best') {
		sql += 'ORDER BY B.LIKE_CNT DESC';
	} else if (orderType === 'hot') {
		sql += 'ORDER BY B.CMNT_CNT DESC';
	}
	const resultData = await queryExecutorResult2(sql, sqlParam);

	const sql2 = 'select BOARD_CD,URL_ORDER,URL_ADDR as url from BOARD_URL where URL_TYPE="image"';
	const resultImg = await queryExecutorResult2(sql2);

	if (resultData.status === 'success' && resultImg.status === 'success') {
		resultData.queryResult.map((board: any) => {
			const tempResult = resultImg.queryResult.filter((img: any) => board.BOARD_CD === img.BOARD_CD);
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

export const setDelCmnt = asyncHandler(async (req, res, next) => {
	const sql = 'DELETE FROM BOARD_COMMENT WHERE CMNT_CD=?';
	const resultData = await queryExecutorResult2(sql, req.body.cmntCd);

	if (resultData.status === 'success') {
		const sql2 = 'UPDATE BOARD SET CMNT_CNT = CMNT_CNT-1 WHERE BOARD_CD=?';
		const resultData2 = await queryExecutorResult2(sql2, req.body.boardCd);

		if (resultData2.status === 'success') {
			return res.status(200).json({
				resultData,
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

export const getComments = asyncHandler(async (req, res, next) => {
	const reqParam = [req.body.brdId];
	const sql = `SELECT A.*, B.USER_NM, B.USER_TITLE
	FROM BOARD_COMMENT A LEFT JOIN USER B
	ON A.USER_UID = B.USER_UID WHERE BOARD_CD = ?`;

	const resultData = await queryExecutorResult2(sql, reqParam);

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

export const deleteBoard = asyncHandler(async (req, res, next) => {
	const sql = 'DELETE FROM BOARD WHERE BOARD_CD=? ';
	const reqParam = [req.body.brdId];
	const resultData = await queryExecutorResult2(sql, reqParam);

	if (resultData.status === 'success') {
		return res.status(200).json({
			resultData: resultData,
		});
	} else {
		return res.status(401).json({
			resultData,
			message: 'query execute failed',
		});
	}
});

export const setComment = asyncHandler(async (req, res, next) => {
	const reqParam = [req.body.brdId, req.body.uuid, req.body.commentArea];
	const sql = `INSERT INTO BOARD_COMMENT VALUES
	(NEXTVAL('CMNT'),?,'comment',?,
	?,null,current_timestamp())
	`;

	const resultData = await queryExecutorResult2(sql, reqParam);

	if (resultData.status === 'success') {
		const reqParam2 = [req.body.brdId];
		const sql2 = 'UPDATE BOARD SET CMNT_CNT = CMNT_CNT + 1 WHERE BOARD_CD = ?';
		const resultData2 = await queryExecutorResult2(sql2, reqParam2);
		if (resultData2.status === 'success') {
			const reqParam3 = [req.body.brdId];
			const sql3 = `SELECT A.*, B.USER_NM, B.USER_TITLE
			FROM BOARD_COMMENT A LEFT JOIN USER B
			ON A.USER_UID = B.USER_UID WHERE BOARD_CD = ?`;
			const resultData3 = await queryExecutorResult2(sql3, reqParam3);
			if (resultData3.status === 'success') {
				return res.status(200).json({
					resultData: resultData3,
				});
			} else {
				return res.status(401).json({
					resultData: resultData3,
					message: 'query3 execute failed',
				});
			}
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
