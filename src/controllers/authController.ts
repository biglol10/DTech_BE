import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import asyncHandler from '../middleware/async';
import { dayjsKor } from '../util/dateFunc';
import { generateUID } from '../util/customFunc';
import { queryExecutorResult, queryExecutorResult2 } from '../util/queryExecutorResult';
import ErrorResponse, { ErrorCode } from '../util/errorResponse';
import dtechCommonProp from '../util/dtechCommon';
import { tokenService } from '../services/TokenService';

export const uploadUserImg = asyncHandler(async (req: any, res, next) => {
	return res.status(200).json({
		result: 'success',
	});
});

export const uploadUserImgS3 = asyncHandler(async (req: any, res, next) => {
	// console.log(req.files);
	return res.status(200).json({
		result: 'success',
	});
});

export const getUserByToken = asyncHandler(async (req, res, next) => {
	return res.status(200).json({
		success: true,
		user: req.user,
	});
});

export const registerUser = asyncHandler(async (req, res, next) => {
	const { name, user_id, passwd, team, title, phonenum, detail, tech_list, github, domain } = req.body;

	const time = dayjsKor().format('YYYY-MM-DD HH:mm:ss');
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(passwd, salt);
	const uuid = generateUID();

	const sql = `
		INSERT INTO USER(USER_UID, USER_ID, USER_NM, USER_PW, TEAM_CD,
		USER_TITLE, USER_PHONENUM, USER_DETAIL, GITHUB_URL, USER_DOMAIN, 
		REGISTER_DATE, USER_ADMIN_YN) 
		VALUES (?, ?, ?, ?, ?, ?,?, ?,?,?, CURRENT_TIMESTAMP,  0)
	`;

	const resultData: any = await queryExecutorResult2(sql, [uuid, user_id, name, hashedPassword, team, title, phonenum, detail, github, domain]);
	if (resultData.status !== 'success') {
		return res.status(401).json({
			result: 'fail',
			message: 'resultData1 failed',
			status: resultData.status,
			sqlMessage: resultData.sqlMessage,
		});
	}
	// let resultData2 = { status: 'success' };
	if (tech_list.length > 0) {
		let techStr = '';
		const techArr = [];
		for (const i in tech_list) {
			techStr += `(?,?),`;
			techArr.push(uuid);
			techArr.push(tech_list[i]);
		}
		techStr = techStr.slice(0, -1);

		const sql = `INSERT INTO USER_TECH(USER_UID,TECH_CD) VALUES ` + techStr;

		const resultData2 = await queryExecutorResult2(sql, techArr);

		if (resultData2.status !== 'success') {
			return res.status(401).json({
				result: 'fail',
				message: 'resultData2 failed',
				status: resultData.status,
				sqlMessage: resultData.sqlMessage,
			});
		}
	}

	// Generate Access Token (15m) and Refresh Token (7d)
	const { accessToken, refreshToken } = tokenService.generateTokenPair(user_id);

	// Set refresh token as httpOnly cookie
	const refreshTokenCookieOptions = tokenService.getRefreshTokenCookieOptions();

	// io.emit('newUserCreated');

	return res.status(201).cookie('refreshToken', refreshToken, refreshTokenCookieOptions).json({
		success: true,
		result: 'success',
		accessToken,
		user: {
			name,
			title,
			user_id,
			uuid,
			time,
		},
	});
});

export const idCheck = asyncHandler(async (req, res) => {
	const { userId } = req.body;
	const sql = `SELECT EXISTS (SELECT * FROM USER WHERE USER_ID = ?) AS SUCCESS`;

	const resultData = await queryExecutorResult2(sql, [userId]);
	const foundId = resultData.queryResult[0].SUCCESS == 1 ? true : false;

	if (resultData.status === 'success') {
		return res.status(200).json({
			result: 'success',
			foundId,
		});
	} else {
		return res.status(401).json({
			result: 'fail',
			message: 'Id Check failed',
		});
	}
});

export const getTeamList = asyncHandler(async (req, res) => {
	const sql = 'SELECT * FROM TEAM';

	const resultData = await queryExecutorResult2(sql);
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

export const setProfileImage = asyncHandler(async (req, res) => {
	const imgUrl: string = `https://${process.env.BUCKET_BASE}.s3.ap-northeast-2.amazonaws.com/` + req.body.imgArr[0];

	const sql = `
	UPDATE USER SET USER_IMG_URL=?  
	WHERE USER_UID = ?`;

	const resultData = await queryExecutorResult2(sql, [imgUrl, req.body.postData.uuid]);

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

export const getTechList = asyncHandler(async (req, res) => {
	const sql = 'SELECT * FROM TECH';

	const resultData = await queryExecutorResult2(sql);
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

export const loginUser = asyncHandler(async (req, res, next) => {
	const { userId, password } = req.body;

	if (!userId || !password) {
		return next(new ErrorResponse('아이디/비밀번호를 입력해주세요', 400));
	}

	const userFindSql = `SELECT * FROM USER WHERE USER_ID = ?`;

	const { queryResult: selectedUser }: any = await queryExecutorResult2(userFindSql, [userId]);

	if (selectedUser.length === 0) {
		return next(new ErrorResponse('로그인에 실패했습니다', 401));
	}

	const isMatch = await matchPassword(password, selectedUser[0].USER_PW);

	if (!isMatch) {
		return next(new ErrorResponse('로그인에 실패했습니다', 401));
	}

	const updateUserLoginSql = `UPDATE USER SET REGISTER_DATE = SYSDATE() WHERE USER_ID = ?`;

	const { queryResult: updateResult, status: userUpdateResult } = await queryExecutorResult2(updateUserLoginSql, [userId]);

	if (userUpdateResult === 'error') {
		return next(new ErrorResponse('Update 쿼리에 문제가 발생했습니다', 401));
	}

	if (updateResult.affectedRows) {
		// Generate Access Token (15m) and Refresh Token (7d)
		const { accessToken, refreshToken } = tokenService.generateTokenPair(userId);

		// Set refresh token as httpOnly cookie
		const refreshTokenCookieOptions = tokenService.getRefreshTokenCookieOptions();

		const time = dayjsKor().format('YYYY-MM-DD HH:mm:ss');

		return res.status(200).cookie('refreshToken', refreshToken, refreshTokenCookieOptions).json({
			success: true,
			result: 'success',
			accessToken,
			user: {
				name: selectedUser[0].USER_NM,
				userId,
				userUID: selectedUser[0].USER_UID,
				userProfileImg: selectedUser[0].USER_IMG_URL,
				time,
			},
		});
	} else {
		return res.status(401).json({
			success: false,
			result: 'error',
			message: 'User login failed',
		});
	}
});

export const getUsersStatus = asyncHandler(async (req, res, next) => {
	// const usersOnline = req.query.onlineUsers as string[];
	const { onlineUsers: usersOnline } = req.body;

	if (usersOnline.length) {
		let sqlScript = '';

		const stringReduce = usersOnline.reduce((previouseValue, currentValue, idx) => {
			if (idx === 1) {
				return `'${previouseValue}', '${currentValue}'`;
			}

			return `${previouseValue}, '${currentValue}'`;
		});

		sqlScript = `SELECT USER_UID, USER_ID, USER_NM, USER_TITLE, USER_DETAIL, USER_IMG_URL, USER_ADMIN_YN, 'ONLINE' AS ONLINE_STATUS FROM USER WHERE USER_ID IN (${
			usersOnline.length === 1 ? `'${stringReduce}'` : `${stringReduce}`
		}) UNION `;
		sqlScript += `SELECT USER_UID, USER_ID, USER_NM, USER_TITLE, USER_DETAIL, USER_IMG_URL, USER_ADMIN_YN, 'OFFLINE' AS ONLINE_STATUS FROM USER WHERE USER_ID NOT IN (${
			usersOnline.length === 1 ? `'${stringReduce}'` : `${stringReduce}`
		})`;

		const { status: queryResultStatus, queryResult } = await queryExecutorResult(sqlScript);

		if (queryResultStatus !== 'success') {
			return next(new ErrorResponse('Error executing sql script', 401));
		}

		if (!queryResult || queryResult.length === 0) {
			return next(new ErrorResponse('Error executing sql script', 401));
		}

		return res.status(200).json({
			result: 'success',
			usersStatus: queryResult,
		});
	} else {
		res.status(200).json({
			result: 'success',
			usersStatus: [],
		});
	}
});

export const getUsersInfo = asyncHandler(async (req, res, next) => {
	const usersParam = req.query.usersParam as string[];

	if (usersParam.length) {
		let sqlScript = '';

		const stringReduce = usersParam.reduce((previouseValue, currentValue, idx) => {
			if (idx === 1) {
				return `'${previouseValue}', '${currentValue}'`;
			}

			return `${previouseValue}, '${currentValue}'`;
		});

		sqlScript = `SELECT USER_UID, USER_ID, USER_NM, USER_TITLE, USER_DETAIL, USER_IMG_URL FROM USER WHERE USER_UID IN (${
			usersParam.length === 1 ? `'${stringReduce}'` : `${stringReduce}`
		})`;

		const { status: queryResultStatus, queryResult } = await queryExecutorResult(sqlScript);

		if (queryResultStatus !== 'success') {
			return next(new ErrorResponse('Error executing sql script', 401));
		}

		if (!queryResult || queryResult.length === 0) {
			return next(new ErrorResponse('Error executing sql script', 401));
		}

		return res.status(200).json({
			result: 'success',
			usersInfo: queryResult,
			usersOnline: queryResult.map((item: any) => {
				const user = dtechCommonProp.getUsersSocket.find((user) => user.userId === item.USER_ID);
				if (user && user.socketId) {
					return { userUID: item.USER_UID, userId: item.USER_ID, status: 'online' };
				} else {
					return { userUID: item.USER_UID, userId: item.USER_ID, status: 'offline' };
				}
			}),
		});
	} else {
		res.status(200).json({
			result: 'success',
			usersInfo: [],
			usersOnline: ['offline'],
		});
	}
});

const matchPassword = async (enteredPassword: string, dbPassword: string) => {
	return await bcrypt.compare(enteredPassword, dbPassword);
};

/**
 * Refresh Access Token
 * Uses refresh token from cookie to generate new access token
 */
export const refreshAccessToken = asyncHandler(async (req, res, next) => {
	// Get refresh token from cookie
	const refreshToken = req.cookies?.refreshToken;

	if (!refreshToken) {
		return next(new ErrorResponse('Refresh token not found. Please login again.', 401, ErrorCode.REFRESH_TOKEN_EXPIRED));
	}

	try {
		// Verify refresh token
		const decoded = tokenService.verifyRefreshToken(refreshToken);

		// Generate new access token
		const newAccessToken = tokenService.generateAccessToken(decoded.id);

		return res.status(200).json({
			success: true,
			accessToken: newAccessToken,
			message: 'Access token refreshed successfully',
		});
	} catch (error: any) {
		// Handle refresh token errors
		if (error.message === 'REFRESH_TOKEN_EXPIRED') {
			// Clear the expired refresh token cookie
			res.clearCookie('refreshToken');
			return next(new ErrorResponse('Refresh token has expired. Please login again.', 401, ErrorCode.REFRESH_TOKEN_EXPIRED));
		}

		if (error.message === 'INVALID_REFRESH_TOKEN') {
			res.clearCookie('refreshToken');
			return next(new ErrorResponse('Invalid refresh token. Please login again.', 401, ErrorCode.INVALID_REFRESH_TOKEN));
		}

		return next(new ErrorResponse('Token refresh failed', 401, ErrorCode.UNAUTHORIZED));
	}
});

/**
 * Logout
 * Clears refresh token cookie
 */
export const logout = asyncHandler(async (req, res, next) => {
	// Clear refresh token cookie
	res.clearCookie('refreshToken', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		path: '/',
	});

	return res.status(200).json({
		success: true,
		message: 'Logged out successfully',
	});
});

/**
 * @deprecated Legacy token response function - replaced by TokenService
 * Kept for backward compatibility, but should not be used in new code
 */
const tokenResponse = (userId: string, jwt_secret: string) => {
	const token = jwt.sign({ id: userId }, jwt_secret, {
		expiresIn: process.env.JWT_EXPIRE,
	});

	const cookie_expire = process.env.COOKIE_EXPIRE ? parseInt(process.env.COOKIE_EXPIRE, 10) : 30;

	const options = {
		expires: new Date(Date.now() + cookie_expire * 24 * 60 * 60 * 1000),
		httpOnly: true,
		secure: false,
	};

	if (process.env.NODE_ENV === 'production') {
		options.secure = true;
	}

	return { token, options };
};
