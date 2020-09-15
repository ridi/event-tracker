module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  extends: [
    '@ridi/eslint-config',
    '@ridi/eslint-config/typescript',
    '@ridi/eslint-config/prettier',
  ],
  overrides: [],
  rules: {
    'no-console': 0,
    semi: [2, 'always'],
  },
  ignorePatterns: ['**/node_modules/**'],
};
