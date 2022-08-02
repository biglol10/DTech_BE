import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import {
	loginUser,
	registerUser,
	idCheck,
	getTeamList,
	uploadUserImg,
	getUserByToken,
	getTechList,
} from '@src/controllers/authController';
import { protectedApi } from '@src/middleware/auth';

const multer = require('multer');

// [[S3 임시용]]
const aws = require('aws-sdk');

const multerS3 = require('multer-s3');

const s3 = new aws.S3({
	accessKeyId: 'AKIAWRZOSE6BQ56VHDBB',
	secretAccessKey: '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',
	region: 'ap-northeast-2',
});

const storage = multerS3({
	s3: s3,
	bucket: 'dcx-upload-test',
	// contentType: multerS3.AUTO_CONTENT_TYPE,
	acl: 'public-read-write',
	key: function (req: any, file: any, cb: any) {
		// var filename = file.originalname;
		console.log('multerS3');
		// console.log(s3);
		// cb(null, `images/profile/test.jpeg`);
		// cb(null, filename);

		cb(null, `${Date.now()}_${file.originalname}`);
	},
});

let upload = multer({
	storage: storage,
});

// var path = require('path');
// const storage = multer.diskStorage({
// 	destination: function (req: any, file: any, cb: any) {
// 		cb(null, 'images/userImg/');
// 	},
// 	filename: function (req: any, file: any, cb: any) {
// 		console.log('storage!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
// 		console.log(req);
// 		console.log('file!!!!!!!!!!');
// 		console.log(file);

// 		// cb(null, Date.now() + path.extname(file.originalname));

// 		cb(null, file.originalname);
// 	},
// });

// const upload = multer({
// 	storage: storage,
// });

const router = Router();

router.route('/registerUser').post(registerUser);

router.route('/loginUser').post(loginUser);

router.route('/idCheck').post(idCheck);

router.route('/getTeamList').post(getTeamList);

router.route('/getTechList').post(getTechList);

router.route('/uploadUserImg').post(upload.single('img'), () => {
	console.log('uploadUserImg');
	uploadUserImg;
});

router.post('/getLoggedInUserInfo', protectedApi, getUserByToken);

export default router;
