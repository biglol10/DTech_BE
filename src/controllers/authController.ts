import asyncHandler from '@src/middleware/async';
import { queryExecutorResult } from '@src/util/queryExecutorResult';
import ErrorResponse from '@src/util/errorResponse';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { generateUID } from '@src/util/customFunc';
import { Request, Response, NextFunction } from 'express';
import { usersSocket } from '@src/util/memoryStorage';

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault('Asia/Seoul');

export const uploadUserImg = asyncHandler(async (req: any, res, next) => {
	console.log('uploadTest');

	console.log(req.file);
	return res.status(200).json({
		result: 'success',
	});
});

export const uploadUserImgS3 = asyncHandler(async (req: any, res, next) => {
	console.log('uploadTest!!!!!!!!!!!!!!!!!!');
	console.log(req.files);

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
	console.log(req.body);
	const { name, user_id, passwd, team, title, phonenum, detail, tech_list } = req.body;

	const time = dayjs();
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(passwd, salt);
	const uuid = generateUID();

	const sql = `INSERT INTO USER(USER_UID, USER_ID, NAME, PASSWD, TEAM_CD, TITLE, PHONENUM, DETAIL, REGISTER_DATE, ADMIN) VALUES ('${uuid}', '${user_id}', '${name}', '${hashedPassword}', '${team}', '${title}','${phonenum}', '${detail}', CURRENT_TIMESTAMP,  0)`;

	const resultData = await queryExecutorResult(sql);

	console.log(resultData);
	let resultData2 = { status: 'success' };
	if (tech_list.length > 0 && resultData.status === 'success') {
		console.log('tech_list!!');
		let techValues = '';
		for (var i in tech_list) {
			techValues += `('${uuid}','${tech_list[i]}'),`;
		}
		techValues = techValues.slice(0, -1);

		const sql = `INSERT INTO USER_TECH(USER_UID,TECH_CD) VALUES ${techValues};`;
		resultData2 = await queryExecutorResult(sql);
	}
	if (
		resultData.status === 'success' &&
		resultData2.status === 'success' &&
		process.env.JWT_SECRET
	) {
		// const token = jwt.sign({ id: user_id }, process.env.JWT_SECRET, {
		// 	expiresIn: process.env.JWT_EXPIRE,
		// });

		// const cookie_expire = process.env.COOKIE_EXPIRE
		// 	? parseInt(process.env.COOKIE_EXPIRE, 10)
		// 	: 30;

		const { token, options } = tokenResponse(user_id, process.env.JWT_SECRET);

		return res.status(200).cookie('user_token', token, options).json({
			name,
			title,
			user_id,
			uuid,
			time,
			token,
			result: 'success',
		});
	} else {
		return res.status(401).json({
			result: 'fail',
			message: 'User register failed',
			status: resultData.status || 'err from node',
			sqlMessage: resultData.sqlMessage || 'check env var',
		});
	}
});

export const idCheck = asyncHandler(async (req, res, next) => {
	const { userId } = req.body;
	const sql = `SELECT EXISTS (SELECT * FROM USER WHERE USER_ID = '${userId}') AS SUCCESS`;

	const resultData = await queryExecutorResult(sql);
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

export const getTeamList = asyncHandler(async (req, res, next) => {
	const sql = 'SELECT * FROM TEAM';

	const resultData = await queryExecutorResult(sql);
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

export const setProfileImage = asyncHandler(async (req, res, next) => {
	const upload = require('../middleware/multer');
	upload.single('img')(req, res, (err: any) => {
		console.log('setProfileImage');
		console.log(req);
		// console.log(`error~`, err);
		return res.status(200).json({
			result: 'success',
		});
	});
});
export const getTechList = asyncHandler(async (req, res, next) => {
	const sql = 'SELECT * FROM TECH';

	const resultData = await queryExecutorResult(sql);
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

	const userFindSql = `SELECT * FROM USER WHERE USER_ID = '${userId}'`;

	const { queryResult: selectedUser } = await queryExecutorResult(userFindSql);

	if (selectedUser.length === 0) {
		return next(new ErrorResponse('로그인에 실패했습니다', 401));
	}

	const isMatch = await matchPassword(password, selectedUser[0].PASSWD);

	if (!isMatch) {
		return next(new ErrorResponse('로그인에 실패했습니다', 401));
	}

	const updateUserLoginSql = `UPDATE USER SET REGISTER_DATE = SYSDATE() WHERE USER_ID = '${userId}'`;

	const { queryResult: updateResult } = await queryExecutorResult(updateUserLoginSql);

	if (updateResult.affectedRows && process.env.JWT_SECRET) {
		const { token, options } = tokenResponse(userId, process.env.JWT_SECRET);

		const time = dayjs();

		return res.status(200).cookie('user_token', token, options).json({
			name: selectedUser[0].NAME,
			userId,
			time,
			token,
			result: 'success',
			userUID: selectedUser[0].USER_UID,
		});
	} else {
		return res.status(401).json({
			result: 'error',
			message: 'User login failed',
		});
	}
});

export const getUsersStatus = asyncHandler(async (req, res, next) => {
	const usersOnline = req.query.onlineUsers as string[];

	if (!!usersOnline.length) {
		let sqlScript = '';

		const stringReduce = usersOnline.reduce((previouseValue, currentValue, idx) => {
			if (idx === 1) {
				return `'${previouseValue}', '${currentValue}'`;
			}

			return `${previouseValue}, '${currentValue}'`;
		});

		sqlScript = `SELECT USER_UID, USER_ID, NAME, TITLE, DETAIL, IMG_URL, 'ONLINE' AS ONLINE_STATUS FROM USER WHERE USER_ID IN (${
			usersOnline.length === 1 ? `'${stringReduce}'` : `${stringReduce}`
		}) UNION `;
		sqlScript += `SELECT USER_UID, USER_ID, NAME, TITLE, DETAIL, IMG_URL, 'OFFLINE' AS ONLINE_STATUS FROM USER WHERE USER_ID NOT IN (${
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

	if (!!usersParam.length) {
		let sqlScript = '';

		const stringReduce = usersParam.reduce((previouseValue, currentValue, idx) => {
			if (idx === 1) {
				return `'${previouseValue}', '${currentValue}'`;
			}

			return `${previouseValue}, '${currentValue}'`;
		});

		sqlScript = `SELECT USER_UID, USER_ID, NAME, TITLE, DETAIL, IMG_URL FROM USER WHERE USER_UID IN (${
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
				const user = usersSocket.find((user) => user.userId === item.USER_ID);
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

const tokenResponse = (userId: string, jwt_secret: string) => {
	const token = jwt.sign({ id: userId }, jwt_secret, {
		expiresIn: process.env.JWT_EXPIRE,
	});

	const cookie_expire = process.env.COOKIE_EXPIRE ? parseInt(process.env.COOKIE_EXPIRE, 10) : 30;

	const options = {
		expires: new Date(Date.now() + cookie_expire * 24 * 60 * 60 * 1000),
		httpOnly: true, // only want the cookie to be access through client side script
		secure: false,
	};

	if (process.env.NODE_ENV === 'production') {
		options.secure = true; // https (production)
	}

	return { token, options };
};
