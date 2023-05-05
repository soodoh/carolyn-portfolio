module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'prettier'
	],
	rules: {
		'sort-imports': [
			'error',
			{
				ignoreCase: true,
				ignoreDeclarationSort: true
			}
		],
		'import/order': [
			1,
			{
				groups: [
					['builtin', 'external', 'internal'],
					['parent', 'index', 'sibling'],
					'object',
					'type'
				],
				'newlines-between': 'never',
				alphabetize: { order: 'asc', caseInsensitive: true }
			}
		]
	},
	plugins: ['@typescript-eslint', 'import'],
	ignorePatterns: ['*.cjs'],
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		}
	],
	settings: {
		'svelte/typescript': () => require('typescript')
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2021,
		project: 'tsconfig.json',
		extraFileExtensions: ['.svelte']
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	}
};
