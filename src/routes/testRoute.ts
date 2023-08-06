import { Router } from 'express';
import { getTestApi } from '../controllers/testApiController';

const router = Router();

router.route('/').get(getTestApi);

export default router;
