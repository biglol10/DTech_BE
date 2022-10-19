import { Router } from 'express';
import { protectedApi } from '@src/middleware/auth';
import { getTeamSkillsets, getUserSkillFilter } from '@src/controllers/dashboardController';

const router = Router();

router.get('/getTeamSkills', getTeamSkillsets);
router.post('/getUserSkillFilter', getUserSkillFilter);

export default router;
