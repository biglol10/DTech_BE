import { Router } from 'express';
import { getTestApi2 } from '../controllers/testApiController';

const router = Router();

router.route('/').get(getTestApi2);

export default router;
