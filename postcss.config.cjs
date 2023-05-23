module.exports = {
	plugins: {
    'postcss-normalize': {},
    'postcss-flexbugs-fixes': {},
		'@csstools/postcss-global-data': {
			files: ['./src/lib/globals.css'],
		},
    'postcss-preset-env': {
      autoprefixer: {},
      stage: 3,
      features: {
        'custom-media-queries': true,
      }
    },
    cssnano: {
      preset: 'default',
    },
	},
};
