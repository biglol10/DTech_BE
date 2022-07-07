import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { loginUser, registerUser } from '@src/controllers/authController';

const router = Router();

router.route('/registerUser').post(registerUser);

router.route('/loginUser').post(loginUser);

export default router;
