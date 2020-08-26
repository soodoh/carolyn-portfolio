module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    // Uses the recommended rules from @eslint-plugin-react
    'plugin:react/recommended',
    // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:@typescript-eslint/eslint-recommended',
    // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:@typescript-eslint/recommended',
    // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    'prettier/@typescript-eslint',
  ],
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
      arrowFunctions: true,
    },
  },
  plugins: ['react', '@typescript-eslint', 'prettier'],
  settings: {
    react: {
      version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        paths: ['./src'],
      },
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
  },
};

