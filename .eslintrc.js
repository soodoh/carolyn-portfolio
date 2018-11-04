module.exports = {
	"extends": [
		"airbnb",
	],
	"parser": "babel-eslint",
	"parserOptions": {
		"allowImportExportEverywhere": true,
		"ecmaFeatures": {
			"jsx": true,
			"es6": true,
		},
		"ecmaVersion": 2018
	},
	"env": {
		"browser": true,
		"node": true,
		"jest": true,
	},
	"plugins": [
    "react",
    "jest",
  ],
  "settings": {
    "import/resolver": {
      // Removes no-unresolved error for '@' alias we use for root directory
      "alias": {
        "map": [
          ['@', './'],
          ['data', './__mocks__/data']
        ]
      }
    }
  },
	"rules": {
		/**
		 * 1st parameter severity options for all rules listed below:
		 * 2 = Error. Uses red wiggly underline.
		 * 1 = Warning. Uses green wiggly underline.
		 * 0 = Non-issue / Disabled rule. No underline displayed.
		 */

		// Warns on console usage
		"no-console": [1],

		// Relaxes no unary operator for for loops
    "no-plusplus": [2, { "allowForLoopAfterthoughts": true }],

		//  Requires function expressions to have a name, if the name cannot be assigned automatically in an ES6 environment
		"func-names": ["error", "as-needed"],

    // Max length of a row
    // Changes to warning
		"max-len": [1, 100, 2, {
      ignoreUrls: true,
      ignoreComments: false,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
    }],
	}
}
