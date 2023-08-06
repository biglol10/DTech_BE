import crypto from 'crypto';
import { axiosFetchMetadata } from '../controllers/utilsController';

const generateUID = () => {
	return crypto.randomBytes(20).toString('hex').substring(0, 20);
};

const LinkArrFetchMetadata = async (queryResult: any) => {
	const metadataAxiosRequest = queryResult.map(async (item: any, idx: number) => {
		if (item.LINK_LIST !== '[]') {
			const linkArr = JSON.parse(item.LINK_LIST);
			const metadataArr: any = [];
			const metadataFetch = linkArr.map(async (url: string) => {
				const metadataResult = await axiosFetchMetadata(url);
				metadataArr.push(metadataResult);
			});

			await Promise.all(metadataFetch);

			queryResult[idx].LINK_LIST = metadataArr;
		} else {
			queryResult[idx].LINK_LIST = [];
		}
	});

	await Promise.all(metadataAxiosRequest);

	return queryResult;
};

export { generateUID, LinkArrFetchMetadata };
