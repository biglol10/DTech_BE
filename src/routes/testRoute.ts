import { Router } from 'express';
import { getTestApi, getTestApi2, postTestApiWithLogin } from '@src/controllers/testApiController';

const router = Router();

router.route('/').get(getTestApi2);

export default router;
