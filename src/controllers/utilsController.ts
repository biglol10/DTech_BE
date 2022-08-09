import asyncHandler from '@src/middleware/async';
import queryExecutorResult from '@src/util/queryExecutorResult';
import axios from 'axios';
import https from 'https';
import cheerio from 'cheerio';

export const getMetadata = asyncHandler(async (req, res, next) => {
	const linkList = req.query.linkList as string[];

	console.log(linkList);

	const metadataResult: any = [];

	await linkList.map(async (item: string) => {
		await axios({
			url: item,
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

				metadataResult.push({
					status: 'success',
					url: item,
					metadata_title: title,
					metadata_description: description,
					metadata_image: image,
				});
			})
			.catch((error: any) => {
				metadataResult.push({
					status: 'fail',
					url: item,
					metadata_title: '',
					metadata_description: '',
					metadata_image: '',
				});
			});
	});

	return res.json(200).json({
		metadataResult,
	});
});
