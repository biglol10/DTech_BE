import { Router } from 'express';
import { getMetadata, insertErrLog, utilTest } from '../controllers/utilsController';

const router = Router();

router.route('/getMetadata').get(getMetadata);
router.post('/insertErrLog', insertErrLog);
router.get('/utilTest', utilTest);

export default router;
