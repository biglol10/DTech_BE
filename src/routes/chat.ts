import { Router } from 'express';
import {
	getPrivateChatList,
	savePrivateChat,
	getUnReadChatNoti,
} from '@src/controllers/chatController';
import { protectedApi } from '@src/middleware/auth';

const router = Router();

router.post('/getPrivateChatList', protectedApi, getPrivateChatList);
router.post('/savePrivateChat', protectedApi, savePrivateChat);
router.get('/getUnreadChatNoti', getUnReadChatNoti);

export default router;
