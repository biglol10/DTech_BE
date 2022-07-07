import asyncHandler from '@src/middleware/async';
import queryExecutorResult from '@src/util/queryExecutorResult';
import ErrorResponse from '@src/util/errorResponse';
import UserModel from '@src/models/Usermodel';

export const loginUser = asyncHandler(async (req, res, next) => {
	const { userId, password } = req.body;

	if (!userId || !password) {
		return next(new ErrorResponse('아이디/비밀번호를 입력해주세요', 400));
	}

	const user = UserModel.filter((item) => item.USER_ID === userId && item.PASSWD === password);

	if (user && user.length > 0) {
		return res.status(200).json({
			success: true,
			user,
		});
	} else {
		return res.status(401).json({
			success: false,
			user: null,
		});
	}
});
