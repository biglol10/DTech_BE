const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
aws.config.loadFromPath(__dirname + '/../config/s3.json');

const s3 = new aws.S3();

let DIR_PATH = '';
let BOARD_ID = '';

const upload2 = multer();

const upload = multer({
	storage: multerS3({
		s3: s3,
		bucket: 'dcx-tech',
		acl: 'public-read-write',
		contentType: multerS3.AUTO_CONTENT_TYPE,
		key: function (req: any, file: any, cb: any) {
			console.log('upload');
			console.log(req.body);
			cb(null, `${DIR_PATH}${file.originalname}`);
		},
	}),
});

const uploadImg = async (req: any, res: any, key: string, path: string) => {
	DIR_PATH = path;
	// console.log('result');
	// console.log(req);
	upload.array(key)(req, res, (err: any) => {
		if (err !== undefined) {
			console.log(`error~`, err);
		}

		return res.status(200).json({
			result: 'success',
		});
	});
};

export { uploadImg };
