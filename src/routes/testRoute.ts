import { Router } from 'express';

import { getTestApi, getTestApi2, postTestApiWithLogin } from '@src/controllers/testApiController';
import { protect } from '@src/middleware/auth';

const router = Router();

router.route('/').get(getTestApi2);

router.route('/').post(protect, postTestApiWithLogin);

export default router;
