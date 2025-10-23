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
	refreshAccessToken,
	logout,
} from '../controllers/authController';
import { uploadImg } from '../util/s3Connect';
import { protectedApi } from '../middleware/auth';

const router = Router();

// Authentication routes
router.route('/registerUser').post(registerUser);
router.route('/loginUser').post(loginUser);
router.route('/refresh').post(refreshAccessToken); // Refresh access token
router.route('/logout').post(logout); // Logout and clear refresh token

// User management routes
router.route('/idCheck').post(idCheck);
router.route('/getTeamList').post(getTeamList);
router.route('/getTechList').post(getTechList);

// Protected routes
router.post('/uploadUserImg', uploadImg, setProfileImage);
router.post('/getLoggedInUserInfo', protectedApi, getUserByToken);

// User status and info routes
router.post('/getUsersStatus', getUsersStatus);
router.get('/getUsersInfo', getUsersInfo);

export default router;
