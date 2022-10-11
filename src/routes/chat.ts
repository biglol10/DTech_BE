import { Router } from 'express';
import {
	getPrivateChatList,
	getGroupChatList,
	getUnReadChatNoti,
	createChatGroup,
	getChatGroups,
	uploadChatImg,
} from '@src/controllers/chatController';
import { protectedApi } from '@src/middleware/auth';
import { uploadImg } from '@src/util/s3Connect';

const router = Router();

router.post('/getPrivateChatList', protectedApi, getPrivateChatList);
router.post('/getGroupChatList', protectedApi, getGroupChatList);
router.get('/getUnreadChatNoti', getUnReadChatNoti);
router.post('/createChatGroup', protectedApi, createChatGroup);
router.get('/getChatGroups', getChatGroups);
router.post('/uploadChatImg', uploadImg, uploadChatImg);

export default router;
