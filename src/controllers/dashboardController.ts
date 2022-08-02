import asyncHandler from '@src/middleware/async';
import queryExecutorResult from '@src/util/queryExecutorResult';

const waitingTime = () => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(`The api called and value is ${Math.random() * 100}`);
		}, 1000);
	});
};

export const getTeamSkillsets = asyncHandler(async (req, res, next) => {
	await waitingTime();

	res.status(200).json({
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
