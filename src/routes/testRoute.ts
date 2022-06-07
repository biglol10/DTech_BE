import { Router } from 'express';

import { getTestApi, getTestApi2 } from '@src/controllers/testApiController';

const router = Router();

router.get('/', getTestApi2);

export default router;
