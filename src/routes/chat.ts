import { Router } from 'express';
import {
	getPrivateChatList,
	getGroupChatList,
	getUnReadChatNoti,
	createChatGroup,
	getChatGroups,
	uploadChatImg,
	insertPrivateChatMessage,
} from '@src/controllers/chatController';
import { uploadImg } from '@src/util/s3Connect';

const router = Router();

router.post('/getPrivateChatList', getPrivateChatList);
router.post('/getGroupChatList', getGroupChatList);
router.post('/getUnreadChatNoti', getUnReadChatNoti);
router.post('/createChatGroup', createChatGroup);
router.post('/getChatGroups', getChatGroups);
router.post('/uploadChatImg', uploadImg, uploadChatImg);
router.post('/insertPrivateChatMessage', insertPrivateChatMessage);

export default router;
