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
} from '../controllers/authController';
import { uploadImg } from '../util/s3Connect';
import { protectedApi } from '../middleware/auth';

const router = Router();

router.route('/registerUser').post(registerUser);

router.route('/loginUser').post(loginUser);

router.route('/idCheck').post(idCheck);

router.route('/getTeamList').post(getTeamList);

router.route('/getTechList').post(getTechList);

router.post('/uploadUserImg', uploadImg, setProfileImage);

router.post('/getLoggedInUserInfo', protectedApi, getUserByToken);

router.post('/getUsersStatus', getUsersStatus);

router.get('/getUsersInfo', getUsersInfo);

export default router;
