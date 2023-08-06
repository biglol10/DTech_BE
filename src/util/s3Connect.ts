import multer from 'multer';
import multerS3 from 'multer-s3';
import aws from 'aws-sdk';
import ErrorResponse from './errorResponse';

aws.config.update({
	accessKeyId: process.env.accessKeyId,
	secretAccessKey: process.env.secretAccessKey,
	region: process.env.region,
});

const s3: any = new aws.S3();

let POSTDATA: any;
let imgArr: any = [];

interface ExpressRequest extends Express.Request {
	body: any;
}

type MulterCallback = (error: Error | null, key?: string) => void;

const upload = multer({
	storage: multerS3({
		s3: s3,
		bucket: `${process.env.BUCKET_BASE}`,
		acl: 'public-read-write',
		contentType: multerS3.AUTO_CONTENT_TYPE,
		key: async function (req: ExpressRequest, file: Express.Multer.File, cb: MulterCallback) {
			POSTDATA = req.body.postData !== undefined ? JSON.parse(req.body.postData) : {};

			if (POSTDATA.type === 'REGISTER_USER') {
				imgArr.push(`${POSTDATA.dir}${file.originalname}`);
				cb(null, `${POSTDATA.dir}${file.originalname}`);
			} else {
				imgArr.push(`${POSTDATA.dir}${file.originalname}`);
				cb(null, `${POSTDATA.dir}${file.originalname}`);
			}
		},
	}),
});

const uploadImg = async (req: any, res: any, next: any) => {
	imgArr = [];

	upload.array('img')(req, res, async (err: any) => {
		if (err !== undefined) {
			return next(new ErrorResponse('AWS s3 upload failed', 401));
		}
		req.body.postData = req.body.postData !== undefined ? JSON.parse(req.body.postData) : {};
		req.body.imgArr = imgArr;
		next();
	});
};

export { uploadImg };
