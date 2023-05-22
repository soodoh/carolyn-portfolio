module.exports = {
	plugins: {
		'@csstools/postcss-global-data': {
			files: ['./src/lib/globals.css'],
		},
		autoprefixer: {},
		'postcss-preset-env': {
			stage: 3,
			features: {
				'custom-media-queries': true,
				'custom-properties': true,
			}
		},
		cssnano: {
			preset: 'default',
		},
	},
};
