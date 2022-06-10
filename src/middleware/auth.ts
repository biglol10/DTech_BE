import { Request } from 'express';
import asyncHandler from '@src/middleware/async';
import ErrorResponse from '@src/util/errorResponse';
import { IGetUserAuthInfoRequest } from '@src/util/commTypes';

export const protect = asyncHandler(async (req: IGetUserAuthInfoRequest, res, next) => {
	let token: string | null = null;

	// if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
	// 	// Set token from Bearer token in header
	// 	token = req.headers.authorization.split(' ')[1];
	// 	// Set token from cookie
	// } else if (req.cookies.token) {
	// 	token = req.cookies.token;
	// }

	// if (!token) {
	// 	return next(new ErrorResponse('Not authorized to access this route', 401));
	// }

	console.log('req body is');
	console.log(req.body);

	const userId = req.body.userId;
	const pw = req.body.pw;

	if (userId === 'biglol' && pw === '1234') {
		req.user = {
			userId,
			pw,
			role: 'admin',
		};
		next();
	} else {
		return next(new ErrorResponse('Not authorized to access this route', 401));
	}
});
