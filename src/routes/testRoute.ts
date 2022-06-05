import { Router } from 'express';

import { getTestApi } from '@src/controllers/testApiController';

const router = Router();

router.get('/', getTestApi);

export default router;
