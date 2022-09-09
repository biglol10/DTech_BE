const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
import { getDateString } from '@src/util/dateFunc';
import ErrorResponse from '@src/util/errorResponse';
aws.config.loadFromPath(__dirname + '/../config/s3.json');

const s3 = new aws.S3();

let POSTDATA: any;
let imgArr: any = [];
let DATE_STR: string;

const upload = multer({
	storage: multerS3({
		s3: s3,
		bucket: 'dcx-tech',
		acl: 'public-read-write',
		contentType: multerS3.AUTO_CONTENT_TYPE,
		key: async function (req: any, file: any, cb: any) {
			// console.log('upload');
			POSTDATA = req.body.postData !== undefined ? JSON.parse(req.body.postData) : {};
			// POSTDATA = JSON.parse(req.body.postData);
			if (POSTDATA.type === 'REGISTER_USER') {
				imgArr.push(`${POSTDATA.dir}${file.originalname}`);
				cb(null, `${POSTDATA.dir}${file.originalname}`);
			} else {
				imgArr.push(`${POSTDATA.dir}${DATE_STR}_${file.originalname}`);
				cb(null, `${POSTDATA.dir}${DATE_STR}_${file.originalname}`);
			}
		},
	}),
});

const uploadImg = async (req: any, res: any, next: any) => {
	imgArr = [];
	DATE_STR = getDateString();

	upload.array('img')(req, res, async (err: any) => {
		if (err !== undefined) {
			console.log(`error~`, err);
			return next(new ErrorResponse('AWS s3 upload failed', 401));
		}
		req.body.postData = POSTDATA;
		req.body.imgArr = imgArr;
		next();
	});
};

// const upload = multer({
// 	storage: multerS3({
// 		s3: s3,
// 		bucket: 'dcx-tech',
// 		acl: 'public-read-write',
// 		contentType: multerS3.AUTO_CONTENT_TYPE,
// 		key: async function (req: any, file: any, cb: any) {
// 			// console.log('upload');
// 			POSTDATA = req.body.postData !== undefined ? JSON.parse(req.body.postData) : {};
// 			// POSTDATA = JSON.parse(req.body.postData);
// 			if (POSTDATA.type === 'REGISTER_USER') {
// 				imgArr.push(`${DIR_PATH}${file.originalname}`);
// 				cb(null, `${DIR_PATH}${file.originalname}`);
// 			} else {
// 				imgArr.push(`${DIR_PATH}${getDateString()}_${file.originalname}`);
// 				cb(null, `${DIR_PATH}${getDateString()}_${file.originalname}`);
// 			}
// 		},
// 	}),
// });

// const uploadImg = async (req: any, res: any, key: string, path: string) => {
// 	DIR_PATH = path;
// 	imgArr = [];

// 	// console.log('uploadImg');

// 	upload.array(key)(req, res, async (err: any) => {
// 		if (err !== undefined) {
// 			console.log(`error~`, err);
// 			return res.status(401).json({
// 				result: 'error',
// 			});
// 		}
// 		POSTDATA = req.body.postData !== undefined ? JSON.parse(req.body.postData) : {};
// 		// console.log(POSTDATA);

// 		if (POSTDATA.type === 'BOARD_SUBMIT') {
// 			const result = await setSubmitBoard2(req, res, POSTDATA, imgArr);

// 			// console.log(result);
// 		}
// 		return res.status(200).json({
// 			result: 'success',
// 		});
// 	});
// };

export { uploadImg };
