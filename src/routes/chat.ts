import { Router } from 'express';
import {
	getPrivateChatList,
	savePrivateChat,
	getUnReadChatNoti,
	uploadChatImg,
	getGroupChatList,
} from '@src/controllers/chatController';
import { protectedApi } from '@src/middleware/auth';
import { uploadImg } from '@src/util/s3Connect';

const router = Router();

router.post('/getPrivateChatList', protectedApi, getPrivateChatList);
router.post('/getGroupChatList', protectedApi, getGroupChatList);
router.post('/savePrivateChat', protectedApi, savePrivateChat);
router.get('/getUnreadChatNoti', getUnReadChatNoti);
router.post('/uploadChatImg', uploadImg, uploadChatImg);

export default router;
