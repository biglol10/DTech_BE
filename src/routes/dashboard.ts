import { Router } from 'express';
import { protectedApi } from '@src/middleware/auth';
import { getTeamSkillsets, getUserSkillFilter } from '@src/controllers/dashboardController';

const router = Router();

router.get('/getTeamSkills', protectedApi, getTeamSkillsets);
router.post('/getUserSkillFilter', protectedApi, getUserSkillFilter);

export default router;
