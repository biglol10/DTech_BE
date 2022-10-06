import { Router } from 'express';
import { getUserInfo, getUserSkills } from '@src/controllers/profileController';

const router = Router();

router.route('/userInfo').post(getUserInfo);
router.route('/userSkills').post(getUserSkills);

export default router;
