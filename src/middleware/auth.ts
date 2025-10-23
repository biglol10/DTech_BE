import { Request } from 'express';
import asyncHandler from './async';
import ErrorResponse, { ErrorCode } from '../util/errorResponse';
import { queryExecutorResult2 } from '../util/queryExecutorResult';
import { tokenService } from '../services/TokenService';

interface IReqWithUser extends Request {
	[name: string]: any;
}

/**
 * Protected API middleware
 * Validates Access Token from Authorization header
 */
export const protectedApi = asyncHandler(async (req: any, res, next) => {
	let token;

	// Extract token from Authorization header (Bearer token)
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1];
	}
	// Legacy support: check for token in cookies (not recommended for Access Token)
	else if (req.cookies?.token) {
		token = req.cookies.token;
	}

	// No token provided
	if (!token) {
		return next(new ErrorResponse('Access token is required', 401, ErrorCode.NO_TOKEN_PROVIDED));
	}

	try {
		// Verify access token
		const decoded = tokenService.verifyAccessToken(token);

		// Fetch user from database using parameterized query (SQL injection prevention)
		const sql = `SELECT USER_UID, USER_ID, USER_NM, TEAM_CD, USER_TITLE, USER_ADMIN_YN, USER_IMG_URL
		             FROM USER WHERE USER_ID = ?`;
		const { status: isQuerySuccess, queryResult: selectedUser } = await queryExecutorResult2(sql, [decoded.id]);

		// Check if user exists
		if (isQuerySuccess !== 'success' || !selectedUser || selectedUser.length === 0) {
			return next(new ErrorResponse('User not found', 404, ErrorCode.RESOURCE_NOT_FOUND));
		}

		// Attach user to request object
		req.user = selectedUser[0];
		next();
	} catch (error: any) {
		// Handle specific token errors with error codes for frontend
		if (error.message === 'ACCESS_TOKEN_EXPIRED') {
			return next(new ErrorResponse('Access token has expired. Please refresh your token.', 401, ErrorCode.ACCESS_TOKEN_EXPIRED));
		}

		if (error.message === 'INVALID_ACCESS_TOKEN') {
			return next(new ErrorResponse('Invalid access token', 401, ErrorCode.INVALID_ACCESS_TOKEN));
		}

		// Generic unauthorized error
		return next(new ErrorResponse('Not authorized to access this route', 401, ErrorCode.UNAUTHORIZED));
	}
});
