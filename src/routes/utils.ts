import { Router } from 'express';
import { getMetadata } from '@src/controllers/utilsController';

const router = Router();

router.get('/getMetadata', getMetadata);

export default router;
