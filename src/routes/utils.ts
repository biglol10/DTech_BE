import { Router } from 'express';
import { getMetadata } from '@src/controllers/utilsController';

const router = Router();

router.route('/getMetadata').get(getMetadata);

// router.get('/getMetadata', getMetadata);

export default router;
