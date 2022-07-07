import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { loginUser } from '@src/controllers/authController';

const router = Router();

router.route('/loginUser').post(loginUser);

export default router;
