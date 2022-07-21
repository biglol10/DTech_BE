import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { protectedApi } from '@src/middleware/auth';
import {
	loginUser,
	registerUser,
	loginTest,
	getUserByToken,
} from '@src/controllers/authController';

const router = Router();

router.route('/registerUser').post(registerUser);

router.route('/loginUser').post(loginUser);

router.post('/getLoggedInUserInfo', protectedApi, getUserByToken);

export default router;
