import { Router } from 'express';
import { getBoardList, setBoardLike } from '@src/controllers/boardController';

const router = Router();

router.route('/getBoardList').post(getBoardList);
router.route('/setBoardLike').post(setBoardLike);

export default router;
