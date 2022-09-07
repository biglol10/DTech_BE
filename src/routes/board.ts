import { Router } from 'express';
import { getBoardList, setBoardLike, setBoardImage } from '@src/controllers/boardController';

const router = Router();

router.route('/getBoardList').post(getBoardList);
router.route('/setBoardLike').post(setBoardLike);
// router.route('/setSubmitBoard').post(setSubmitBoard);
router.post('/uploadBoardImg', setBoardImage);

export default router;
