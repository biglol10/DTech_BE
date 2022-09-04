import asyncHandler from '@src/middleware/async';
import { queryExecutorResult } from '@src/util/queryExecutorResult';
import ErrorResponse from '@src/util/errorResponse';

// const waitingTime = () => {
// 	return new Promise((resolve) => {
// 		setTimeout(() => {
// 			resolve(`The api called and value is ${Math.random() * 100}`);
// 		}, 1000);
// 	});
// };

export const getTeamSkillsets = asyncHandler(async (req, res, next) => {
	const teamSkillSetSql = `SELECT T1.TECH_CD, T2.TECH_NM, T2.TECH_DETAIL, T2.TECH_PAGE_URL, count(*) AS TECH_CNT from USER_TECH AS T1 INNER JOIN TECH T2 ON T1.TECH_CD = T2.TECH_CD GROUP BY TECH_CD;`;
	const resultData1 = await queryExecutorResult(teamSkillSetSql);

	const memberDashboard = `SELECT T1.USER_UID, T1.USER_ID, T1.USER_NM AS USER_NAME, T1.USER_TEAM_CD, T1.USER_TITLE, T1.USER_PHONENUM, T1.USER_DETAIL, T1.USER_IMG_URL, T1.GITHUB_URL, T1.USER_DOMAIN, T1.PRJ_DETAIL, T2.TECH_CD, T3.TECH_NM AS TECH_NAME FROM USER AS T1 LEFT JOIN USER_TECH AS T2 ON T1.USER_UID = T2.USER_UID LEFT JOIN TECH AS T3 ON T2.TECH_CD = T3.TECH_CD ORDER BY T1.USER_TITLE DESC, T1.USER_NM;`;
	const resultData2 = await queryExecutorResult(memberDashboard);

	const teamSkillCount = `SELECT T1.TECH_NM, T3.USER_NM AS USER_NM, T3.USER_UID, T3.USER_TEAM_CD, T3.USER_TITLE, T3.USER_IMG_URL, T1.TECH_CNT FROM (SELECT T2.TECH_NM, T2.TECH_CD, COUNT(*) AS TECH_CNT FROM USER_TECH AS T1 INNER JOIN TECH AS T2 ON T1.TECH_CD = T2.TECH_CD GROUP BY T2.TECH_NM, T2.TECH_CD) AS T1 LEFT JOIN USER_TECH AS T2 ON T1.TECH_CD = T2.TECH_CD LEFT JOIN USER AS T3 ON T2.USER_UID = T3.USER_UID;`;
	const resultData3 = await queryExecutorResult(teamSkillCount);

	if (
		resultData1.status === 'error' ||
		resultData2.status === 'error' ||
		resultData3.status === 'error'
	) {
		return next(new ErrorResponse('팀 스킬 조회에 실패했습니다', 403));
	}

	const skillObj: any = {};
	resultData3.queryResult.map((item: any) => {
		if (!skillObj[item.TECH_NM]) {
			skillObj[item.TECH_NM] = resultData3.queryResult.filter(
				(item2: any) => item2.TECH_NM === item.TECH_NM,
			);
		}
	});

	res.status(200).json({
		teamSkillDashboard: resultData1.queryResult,
		teamSkillCountObj: skillObj,
		// teamSkillCountArr: Object.keys(skillObj).map((item) => skillObj[item]),
		userDashboard: userSkillReduce(resultData2.queryResult),
	});
});

export const getUserSkillFilter = asyncHandler(async (req, res, next) => {
	const { filterSkill, filterName } = req.body;
	let userSkillFilterSql = `SELECT T1.USER_UID, T1.USER_ID, T1.USER_NM AS USER_NAME, T1.USER_TEAM_CD, T1.USER_TITLE, T1.USER_PHONENUM, T1.USER_DETAIL, T1.USER_IMG_URL, T1.GITHUB_URL, T1.USER_DOMAIN, T1.PRJ_DETAIL, T2.TECH_CD, T3.TECH_NM AS TECH_NAME FROM USER AS T1 LEFT JOIN USER_TECH AS T2 ON T1.USER_UID = T2.USER_UID LEFT JOIN TECH AS T3 ON T2.TECH_CD = T3.TECH_CD WHERE 1 = 1`;
	if (filterSkill !== '전체') {
		userSkillFilterSql += ` AND EXISTS (SELECT * FROM USER_TECH AS T4 INNER JOIN TECH AS T5 ON T4.TECH_CD = T5.TECH_CD AND T5.TECH_NM = '${filterSkill}' AND T1.USER_UID = T4.USER_UID)`;
	}
	if (filterName) {
		userSkillFilterSql += ` AND T1.USER_NM LIKE '%${filterName}%'`;
	}

	const filterResult = await queryExecutorResult(userSkillFilterSql);

	if (filterResult.status === 'error') {
		return next(new ErrorResponse('데이터를 가져오지 못했습니다', 500));
	}

	return res.status(200).json({
		result: 'success',
		filterdUsersList: userSkillReduce(filterResult.queryResult),
	});
});

const userSkillReduce = (userDataResult: any) => {
	const userObj: any = {};
	const userData = userDataResult;
	userData.map((item: any) => {
		if (!userObj[item.USER_ID]) {
			const skillsFilter = userData
				.filter((item2: any) => item2.USER_ID === item.USER_ID)
				.reduce((previousVal: any, currentVal: any) => {
					previousVal.push(currentVal.TECH_NAME);
					return previousVal;
				}, []);
			userObj[item.USER_ID] = {
				USER_UID: item.USER_UID,
				USER_ID: item.USER_ID,
				USER_NAME: item.USER_NAME,
				USER_TEAM_CD: item.USER_TEAM_CD,
				USER_TITLE: item.USER_TITLE,
				USER_PHONENUM: item.USER_PHONENUM,
				USER_DETAIL: item.USER_DETAIL,
				USER_IMG_URL: item.USER_IMG_URL,
				GITHUB_URL: item.GITHUB_URL,
				USER_DOMAIN: item.USER_DOMAIN,
				PRJ_DETAIL: item.PRJ_DETAIL,
				TECH_ARR: skillsFilter,
			};
		}
	});

	return Object.keys(userObj).map((item) => userObj[item]);
};
