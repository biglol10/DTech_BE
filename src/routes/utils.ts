import { Router } from 'express';
import { getMetadata, insertErrLog } from '@src/controllers/utilsController';

const router = Router();

router.route('/getMetadata').get(getMetadata);
router.post('/insertErrLog', insertErrLog);

export default router;
