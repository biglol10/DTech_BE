module.exports = {
	singleQuote: true, // single quoatation 사용 여부
	tabWidth: 4, // 탭 너비
	trailingComma: 'all', // 여러 줄을 사용할 때, 후행 콤마 사용 방식
	semi: true, // 세미콜론 사용 여부
	useTabs: true, // 탭 사용 여부
	arrowParens: 'always', // 화살표 함수 괄호 사용 방식
	printWidth: 100, // 줄 바꿈 할 폭 길이

	overrides: [
		// 특정 파일별로 옵션을 다르게 지정함, ESLint 방식 사용
		{
			files: '*.json',
			options: {
				printWidth: 200,
			},
		},
	],
};
