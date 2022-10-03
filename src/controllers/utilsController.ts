import asyncHandler from '@src/middleware/async';
import axios from 'axios';
import https from 'https';
import cheerio from 'cheerio';
import { metadataStorage } from '@src/util/memoryStorage';

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
