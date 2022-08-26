const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
aws.config.loadFromPath(__dirname + '/../config/s3.json');

const s3 = new aws.S3();
const upload = multer({
	storage: multerS3({
		s3: s3,
		bucket: 'dcx-tech',
		acl: 'public-read-write',
		contentType: multerS3.AUTO_CONTENT_TYPE,
		key: function (req: any, file: any, cb: any) {
			console.log('multers3');
			// console.log(req);
			// console.log(file);
			cb(null, `profile_img/${file.originalname}`);
			// console.log('end');
		},
	}),
});

// const upload2 = ()

module.exports = upload;
