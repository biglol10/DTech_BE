import { Request } from 'express';
import asyncHandler from '@src/middleware/async';
import ErrorResponse from '@src/util/errorResponse';
import jwt from 'jsonwebtoken';
import { queryExecutorResult } from '@src/util/queryExecutorResult';

interface IReqWithUser extends Request {
	[name: string]: any;
}

export const protectedApi = asyncHandler(async (req: any, res, next) => {
	let token;

	console.log('req headers is');
	console.log(req.headers);

	if (req.headers.authorizations && req.headers.authorizations.startsWith('Bearer')) {
		console.log('came to headers');
		console.log(req.headers.authorizations);

		token = req.headers.authorizations.split(' ')[1];
	} else if (req.cookies.token) {
		console.log('came to cookies');
		console.log(req.cookies.token);

		token = req.cookies.token;
	}

	if (!token) {
		return next(new ErrorResponse('Not authorized to access this route', 401));
	}

	try {
		const decoded: any = process.env.JWT_SECRET
			? jwt.verify(token, process.env.JWT_SECRET)
			: '';
		if (decoded) {
			const sql = `SELECT USER_UID, USER_ID, USER_NM, TEAM_CD, USER_TITLE, USER_ADMIN_YN, USER_IMG_URL FROM USER WHERE USER_ID = '${decoded.id}'`;
			const { status: isQuerySuccess, queryResult: selectedUser } = await queryExecutorResult(
				sql,
			);

			if (isQuerySuccess === 'success') {
				req.user = selectedUser[0];
				next();
			} else {
				return next(new ErrorResponse('Not authorized to access this route', 401));
			}
		}
	} catch (error) {
		return next(new ErrorResponse('Not authorized to access this route', 401));
	}
});
