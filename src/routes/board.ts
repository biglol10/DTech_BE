import { Router } from 'express';
import {
	getBoardList,
	setBoardLike,
	setSubmitBoard,
	getComments,
	setComment,
	setDelCmnt,
	deleteBoard,
} from '@src/controllers/boardController';
import { uploadImg } from '@src/util/s3Connect';

const router = Router();

router.route('/getBoardList').post(getBoardList);
router.route('/setBoardLike').post(setBoardLike);
// router.route('/setSubmitBoard').post(setSubmitBoard);
// router.post('/uploadBoardImg', setBoardImage);
router.post('/uploadBoard', uploadImg, setSubmitBoard);
router.post('/getComments', getComments);
router.post('/setComment', setComment);
router.post('/deleteCmnt', setDelCmnt);
router.post('/deleteBoard', deleteBoard);

export default router;
