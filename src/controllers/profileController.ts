import { query } from 'express';
import asyncHandler from '../middleware/async';
import { queryExecutorResult2 } from '../util/queryExecutorResult';

export const getUserInfo = asyncHandler(async (req, res, next) => {
	const sql = `SELECT U.*, T.* FROM USER U LEFT JOIN TEAM T ON U.TEAM_CD=T.TEAM_CD WHERE USER_UID=?`;
	const sqlParam = [req.body.uuid];
	const resultData = await queryExecutorResult2(sql, sqlParam);

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

export const getUserSkills = asyncHandler(async (req, res, next) => {
	const sql = `select UT.*, T.*
  from USER_TECH UT LEFT JOIN TECH T
  ON UT.TECH_CD = T.TECH_CD
  WHERE UT.USER_UID=?`;
	const sqlParam = [req.body.uuid];
	const resultData = await queryExecutorResult2(sql, sqlParam);
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
