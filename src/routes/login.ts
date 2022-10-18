import { Router } from 'express';
import {
	loginUser,
	registerUser,
	idCheck,
	getTeamList,
	getUserByToken,
	getTechList,
	getUsersStatus,
	getUsersInfo,
	setProfileImage,
} from '@src/controllers/authController';
import { protectedApi } from '@src/middleware/auth';
import { uploadImg } from '@src/util/s3Connect';

const router = Router();

router.route('/registerUser').post(registerUser);

router.route('/loginUser').post(loginUser);

router.route('/idCheck').post(idCheck);

router.route('/getTeamList').post(getTeamList);

router.route('/getTechList').post(getTechList);

router.post('/uploadUserImg', uploadImg, setProfileImage);

router.post('/getLoggedInUserInfo', protectedApi, getUserByToken);

router.get('/getUsersStatus', getUsersStatus);

router.get('/getUsersInfo', getUsersInfo);

export default router;
