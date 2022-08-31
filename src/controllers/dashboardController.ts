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
	const teamSkillSetSql = `SELECT T1.TECH_CD, T2.NAME, T2.DETAIL, T2.PAGE_URL, count(*) AS COUNT from USER_TECH AS T1 INNER JOIN TECH T2 ON T1.TECH_CD = T2.TECH_CD GROUP BY TECH_CD;`;
	const resultData1 = await queryExecutorResult(teamSkillSetSql);

	const memberDashboard = `SELECT T1.USER_UID, T1.USER_ID, T1.NAME AS USER_NAME, T1.TEAM_CD, T1.TITLE, T1.PHONENUM, T1.DETAIL, T1.IMG_URL, T1.GITHUB_URL, T1.DOMAIN, T1.PRJ_DETAIL, T2.TECH_CD, T3.NAME AS TECH_NAME FROM USER AS T1 LEFT JOIN USER_TECH AS T2 ON T1.USER_UID = T2.USER_UID LEFT JOIN TECH AS T3 ON T2.TECH_CD = T3.TECH_CD ORDER BY T1.TITLE DESC, T1.NAME;`;
	const resultData2 = await queryExecutorResult(memberDashboard);

	if (resultData1.status === 'error' || resultData2.status === 'error') {
		return next(new ErrorResponse('팀 스킬 조회에 실패했습니다', 403));
	}

	res.status(200).json({
		teamSkillDashboard: resultData1.queryResult,
		userDashboard: userSkillReduce(resultData2.queryResult),
		teamSkillData: [
			{
				subject: 'React',
				count: 10,
			},
			{
				subject: 'Node',
				count: 6,
			},
			{
				subject: 'Vue',
				count: 3,
			},
			{
				subject: 'Typescript',
				count: 7,
			},
			{
				subject: 'Spring',
				count: 5,
			},
			{
				subject: 'Express',
				count: 8,
			},
			{
				subject: 'SCSS',
				count: 4,
			},
			{
				subject: 'Jquery',
				count: 2,
			},
			{
				subject: 'Docker',
				count: 4,
			},
			{
				subject: 'ASPNET',
				count: 2,
			},
			{
				subject: 'React',
				count: 10,
			},
			{
				subject: 'Node',
				count: 6,
			},
			{
				subject: 'Vue',
				count: 3,
			},
			{
				subject: 'Typescript',
				count: 7,
			},
			{
				subject: 'Spring',
				count: 5,
			},
			{
				subject: 'Express',
				count: 8,
			},
			{
				subject: 'SCSS',
				count: 4,
			},
			{
				subject: 'Jquery',
				count: 2,
			},
			{
				subject: 'Docker',
				count: 4,
			},
			{
				subject: 'ASPNET',
				count: 2,
			},
		],
	});
});

export const getUserSkillFilter = asyncHandler(async (req, res, next) => {
	const { filterSkill, filterName } = req.body;
	let userSkillFilterSql = `SELECT T1.USER_UID, T1.USER_ID, T1.NAME AS USER_NAME, T1.TEAM_CD, T1.TITLE, T1.PHONENUM, T1.DETAIL, T1.IMG_URL, T1.GITHUB_URL, T1.DOMAIN, T1.PRJ_DETAIL, T2.TECH_CD, T3.NAME AS TECH_NAME FROM USER AS T1 LEFT JOIN USER_TECH AS T2 ON T1.USER_UID = T2.USER_UID LEFT JOIN TECH AS T3 ON T2.TECH_CD = T3.TECH_CD WHERE 1 = 1`;
	if (filterSkill !== '전체') {
		userSkillFilterSql += ` AND EXISTS (SELECT * FROM USER_TECH AS T4 INNER JOIN TECH AS T5 ON T4.TECH_CD = T5.TECH_CD AND T5.NAME = '${filterSkill}' AND T1.USER_UID = T4.USER_UID)`;
	}
	if (filterName) {
		userSkillFilterSql += ` AND T1.NAME LIKE '%${filterName}%'`;
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
				TEAM_CD: item.TEAM_CD,
				TITLE: item.TITLE,
				PHONENUM: item.PHONENUM,
				DETAIL: item.DETAIL,
				IMG_URL: item.IMG_URL,
				GITHUB_URL: item.GITHUB_URL,
				DOMAIN: item.DOMAIN,
				PRJ_DETAIL: item.PRJ_DETAIL,
				EMAIL: item.EMAIL,
				TECH_ARR: skillsFilter,
			};
		}
	});

	return Object.keys(userObj).map((item) => userObj[item]);
};
