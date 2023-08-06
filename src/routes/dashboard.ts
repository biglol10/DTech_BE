import { Router } from 'express';
import { getTeamSkillsets, getUserSkillFilter } from '../controllers/dashboardController';

const router = Router();

router.post('/getTeamSkills', getTeamSkillsets);
router.post('/getUserSkillFilter', getUserSkillFilter);

export default router;
