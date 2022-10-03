module.exports = {
	env: {
		node: true,
		es2021: true,
	},
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	overrides: [],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint'],
	rules: {
		quotes: ['error', 'single', { allowTemplateLiterals: true }], // ? template literal 허용
		'spaced-comment': ['error', 'always', { markers: ['/'] }], // ? 주석에 이후 1 공백 (markers 안에 있는 것들은 예외) (예를 들어 '//' 이후 '/' 를 쓸 때 1 공백 있어야 하는 룰에 예외처리)
		'object-curly-spacing': ['error', 'always', { objectsInObjects: true }], // ? 중괄호 내부에 일정한 간격을 적용, 중괄호 내부에 공백이 필요합니다(제외 {}).
		'linebreak-style': 'off',
		'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
		'one-var': ['error', 'never'], // ? var a = 5, b = 4 금지
		'no-unused-vars': 'warn',
		'func-style': ['error', 'expression'], // ? var foo = function() {} 스타일만 허용
		'comma-dangle': ['error', 'always-multiline'],
		'import/prefer-default-export': 'off', // ? import { merge, find } from 'module'; 만 허용...  import { merge } from 'module', import { find } from 'module 허용 X
		'dot-notation': 'off', // ? foo["bar"]; 허용
		'arrow-body-style': 'off', // ? let foo = () => 0; 허용 (error이면 let foo = () => { return 0; } 해야됨)
		'no-restricted-imports': [
			'error',
			{
				paths: [
					{
						name: 'moment',
						message: 'Moment 대신 dayjs 사용 권장',
					},
				],
			},
		],
		'no-use-before-define': ['error', { variables: false }], // ? If this is true, the rule warns every reference to a variable before the variable declaration
		'no-console': 'warn', // ? console.log 경고
		'consistent-return': 'off', // ? 굳이 꼭 무언가를 리턴할 필요가 없게끔 설정
		'@typescript-eslint/no-explicit-any': 'warn',
	},
};
