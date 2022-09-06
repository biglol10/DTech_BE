import asyncHandler from '@src/middleware/async';
import { queryExecutorResult2 } from '@src/util/queryExecutorResult';
import { uploadImg } from '@src/util/s3Connect';
const multer = require('multer');

export const setSubmitBoard = asyncHandler(async (req, res, next) => {
	let { type, title, uuid, tech, content, formData } = req.body;
	if (tech === '') {
		tech = null;
	}

	const sql = `INSERT INTO BOARD VALUES
	(NEXTVAL(\'BOARD\'),?,current_timestamp(),
	?,?,?)`;
	const resultData: any = await queryExecutorResult2(sql, [uuid, title, content, tech]);

	if (resultData.status === 'success') {
		const sql2 = `select BOARD_CD, BOARD_TITLE from BOARD 
		where BOARD_UID=?
		order by BOARD_DATE DESC
		limit 1;`;
		const resultData2 = await queryExecutorResult2(sql2, [uuid]);

		if (resultData2.status === 'success') {
			return res.status(200).json({
				result: 'success',
				resultData: resultData2,
			});
		} else {
			return res.status(401).json({
				resultData,
				message: 'query2 execute failed',
				status: resultData.status || 'err from node',
			});
		}
	} else {
		return res.status(401).json({
			resultData,
			message: 'query execute failed',
			status: resultData.status || 'err from node',
		});
	}
});

export const setSubmitBoard2 = async (req: any, res: any, postData: any) => {
	let { type, title, uuid, tech, content } = postData;
	if (tech === '') {
		tech = null;
	}

	const sql = `INSERT INTO BOARD VALUES
	(NEXTVAL(\'BOARD\'),?,current_timestamp(),
	?,?,?)`;
	const resultData: any = await queryExecutorResult2(sql, [uuid, title, content, tech]);
	console.log(resultData);
	if (resultData.status === 'success') {
		const sql2 = `select BOARD_CD, BOARD_TITLE from BOARD 
		where BOARD_UID=?
		order by BOARD_DATE DESC
		limit 1;`;
		const resultData2 = await queryExecutorResult2(sql2, [uuid]);
		console.log(resultData2);
		if (resultData2.status === 'success') {
			// return res.status(200).json({
			// 	result: 'success',
			// 	resultData: resultData2,
			// });
		} else {
			return res.status(401).json({
				resultData,
				message: 'query2 execute failed',
				status: resultData.status || 'err from node',
			});
		}
	} else {
		return res.status(401).json({
			resultData,
			message: 'query execute failed',
			status: resultData.status || 'err from node',
		});
	}
};

const tempF = (req: any, res: any) => {
	const ul = multer();
	return new Promise((resolve, reject) => {
		ul.single('postData')(req, res, async (err: any) => {
			console.log('upload2');
			// const { type, title, uuid, tech, content } = JSON.parse(req.body.img);
			// console.log(type, title, uuid, tech, content);
			console.log(req.body);
			resolve(JSON.parse(req.body.postData));
		});
	});
};

export const setBoardImage = asyncHandler(async (req, res, next) => {
	// console.log('setBoardImg');
	// console.log(req.body);
	// const ul = multer();
	// return new Promise((resolve, reject) => {
	// 	ul.single('img')(req, res, async (err: any) => {
	// 		console.log('upload2');
	// 		const { type, title, uuid, tech, content } = JSON.parse(req.body.img);
	// 		console.log(type, title, uuid, tech, content);
	// 		return { type, title, uuid, tech, content };
	// 	});
	// });
	uploadImg(req, res, 'img', 'board/');
	tempF(req, res).then((result) => {
		console.log('async');
		console.log(result);

		setSubmitBoard2(req, res, result);
	});

	// ul.single('img')(req, res, async (err: any) => {
	// 	console.log('upload2');
	// 	const { type, title, uuid, tech, content } = JSON.parse(req.body.img);
	// 	console.log(type, title, uuid, tech, content);
	// 	return { type, title, uuid, tech, content };
	// });

	// console.log('TTTT');
	// console.log(temp);
	// const result = setSubmitBoard2({ type, title, uuid, tech, content }, req, res);
	// 	console.log(result);
});

export const setBoardLike = asyncHandler(async (req, res, next) => {
	let sql = '';
	if (req.body.like === true) {
		sql = `INSERT INTO BOARD_COMMENT VALUES(NEXTVAL('CMNT'),
    ?,'like', ?, null,null,current_timestamp()); 
    `;
	} else {
		sql = `delete from BOARD_COMMENT 
    WHERE BOARD_CD=? 
    AND CMNT_UID=?;
    `;
	}

	const resultData = await queryExecutorResult2(sql, [req.body.id, req.body.userUID]);

	if (resultData.status === 'success') {
		return res.status(200).json({
			resultData,
		});
	} else {
		return res.status(401).json({
			resultData,
			message: 'query execute failed',
		});
	}
});
export const getBoardList = asyncHandler(async (req, res, next) => {
	const sql = `select B.*,
    IFNULL((select COUNT(C.CMNT_CD) 
    from BOARD_COMMENT C
    where B.BOARD_CD = C.BOARD_CD
    and C.CMNT_TYPE = "comment"
    group by B.BOARD_CD
    ),0) as "COMMENTS_CNT",
    IFNULL((select COUNT(C.CMNT_CD)
    from BOARD_COMMENT C
    where B.BOARD_CD = C.BOARD_CD
    and C.CMNT_TYPE = "like"
    group by B.BOARD_CD
    ),0) as "LIKES_CNT"
    from BOARD B`;

	const resultData = await queryExecutorResult2(sql);
	const sql2 = 'select BOARD_CD,URL_ORDER,URL_ADDR as url from BOARD_URL where URL_TYPE="image"';
	const resultImg = await queryExecutorResult2(sql2);

	if (resultData.status === 'success' && resultImg.status === 'success') {
		resultData.queryResult.map((board: any) => {
			const tempResult = resultImg.queryResult.filter(
				(img: any) => board.BOARD_CD === img.BOARD_CD,
			);
			board.IMG_LIST = tempResult;
		});

		return res.status(200).json({
			resultData,
		});
	} else {
		return res.status(401).json({
			resultData,
			message: 'query execute failed',
		});
	}
});
