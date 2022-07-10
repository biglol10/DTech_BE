import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { loginUser, registerUser, idCheck, getTeamList } from '@src/controllers/authController';

const router = Router();

router.route('/registerUser').post(registerUser);

router.route('/loginUser').post(loginUser);

router.route('/idCheck').post(idCheck);

router.route('/getTeamList').post(getTeamList);

export default router;
