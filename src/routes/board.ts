import { Router } from 'express';
import { getBoardList, setBoardLike, setSubmitBoard } from '@src/controllers/boardController';

const router = Router();

router.route('/getBoardList').post(getBoardList);
router.route('/setBoardLike').post(setBoardLike);
router.route('/setSubmitBoard').post(setSubmitBoard);

export default router;
