import axios from 'axios';
import https from 'https';
import cheerio from 'cheerio';
import asyncHandler from '../middleware/async';
import { metadataStorage } from '../util/memoryStorage';
import { generateUID } from '../util/customFunc';
import { queryExecutorResult2 } from '../util/queryExecutorResult';
import ErrorResponse from '../util/errorResponse';

export const getMetadata = asyncHandler(async (req, res) => {
	const linkList = req.query.linkList as string[];

	const metadataArr: any = [];

	const axiosRequest = linkList.map(async (url: string) => {
		const metadataResult = await axiosFetchMetadata(url);
		metadataArr.push(metadataResult);
	});

	await Promise.all(axiosRequest);

	return res.status(200).json({
		metadataArr: metadataArr,
	});
});

export const axiosFetchMetadata = async (url: string) => {
	if (
		Object.prototype.hasOwnProperty.call(metadataStorage, url) &&
		metadataStorage[url].status === 'success'
	) {
		const { metadata_title, metadata_description, metadata_image } = metadataStorage[url];
		return {
			status: 'success',
			url,
			metadata_title: metadata_title,
			metadata_description: metadata_description,
			metadata_image: metadata_image,
		};
	}
	const fetchedMedadata = await axios({
		url,
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		responseType: 'json',
		httpsAgent: new https.Agent({ rejectUnauthorized: false }),
	})
		.then((response: any) => {
			const text = response.data;

			const $ = cheerio.load(text);
			const title =
				$('meta[property="og:title"]').attr('content') ||
				$('title').text() ||
				$('meta[name="title"]').attr('content');
			const description =
				$('meta[property="og:description"]').attr('content') ||
				$('meta[name="description"]').attr('content');
			// const url = $('meta[property="og:url"]').attr('content');
			// const site_name = $('meta[property="og:site_name"]').attr('content');
			const image =
				$('meta[property="og:image"]').attr('content') ||
				$('meta[property="og:image:url"]').attr('content');
			// const icon =
			// 	$('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href');
			// const keywords =
			// 	$('meta[property="og:keywords"]').attr('content') ||
			// 	$('meta[name="keywords"]').attr('content');

			metadataStorage[url] = {
				status: 'success',
				metadata_title: title,
				metadata_description: description,
				metadata_image: image,
			};

			return {
				status: 'success',
				url,
				metadata_title: title,
				metadata_description: description,
				metadata_image: image,
			};
		})
		.catch(() => {
			metadataStorage[url] = {
				status: 'fail',
				metadata_title: '',
				metadata_description: '',
				metadata_image: '',
			};

			return {
				status: 'fail',
				url,
				metadata_title: '',
				metadata_description: '',
				metadata_image: '',
			};
		});

	return fetchedMedadata;
};

export const insertErrLog = asyncHandler(async (req, res, next) => {
	const { uri, requestType, data, errMsg, userId } = req.body;
	const err_uuid = `errLog_${generateUID()}`;
	const sql = `INSERT INTO ERR_LOG VALUES (?, ?, ?, ?, ?, SYSDATE(), ?)`;

	const execute = await queryExecutorResult2(sql, [
		err_uuid,
		uri,
		requestType,
		data,
		errMsg,
		userId,
	]);

	if (execute.status === 'error') {
		return next(new ErrorResponse('에러로그에 데이터를 넣지 못했습니다', 400));
	}

	return res.status(200).json({ result: 'success' });
});

export const utilTest = asyncHandler(async (req, res, next) => {
	return res.status(200).json({ result: 'successful' });
});
