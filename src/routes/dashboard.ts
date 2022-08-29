import { Router } from 'express';
import { protectedApi } from '@src/middleware/auth';
import { getTeamSkillsets } from '@src/controllers/dashboardController';

const router = Router();

router.get('/getTeamSkills', protectedApi, getTeamSkillsets);

export default router;
