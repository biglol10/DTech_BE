import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import {
	loginUser,
	registerUser,
	idCheck,
	getTeamList,
	uploadUserImg,
	getUserByToken
} from '@src/controllers/authController';
import { protectedApi } from '@src/middleware/auth';

const multer = require('multer');

// [[S3 임시용]]
// const multerS3 = require('multer-s3');
// const aws = require('aws-sdk');
// console.log(__dirname);
// aws.config.loadFromPath(__dirname + '/../../awsconfig.json');
// const s3 = new aws.S3();

// const storage = multerS3({
// 	s3: s3,
// 	bucket: 'dcx-skillmanager',
// 	contentType: multerS3.AUTO_CONTENT_TYPE,
// 	acl: 'public-read-write',
// 	key: function (req: any, file: any, cb: any) {
// 		console.log('multerS3');
// 		console.log(file);
// 		cb(null, `images/profile/test.jpeg`);
// 		// cb(null, file.originalname);
// 	},
// });

// let upload = multer({
// 	storage: storage,
// });

var path = require('path');
const storage = multer.diskStorage({
	destination: function (req: any, file: any, cb: any) {
		cb(null, 'images/userImg/');
	},
	filename: function (req: any, file: any, cb: any) {
		console.log('storage!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
		console.log(req);
		console.log('file!!!!!!!!!!');
		console.log(file);

		// cb(null, Date.now() + path.extname(file.originalname));

		cb(null, file.originalname);
	},
});

const upload = multer({
	storage: storage,
});

const router = Router();

router.route('/registerUser').post(registerUser);

router.route('/loginUser').post(loginUser);

router.route('/idCheck').post(idCheck);

router.route('/getTeamList').post(getTeamList);

router.route('/uploadUserImg').post(upload.single('img'), uploadUserImg);

export default router;
