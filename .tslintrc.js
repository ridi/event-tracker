module.exports = {
  'extends': [
    '@ridi/tslint-config',
    'tslint-config-prettier',
  ],
  'rules': {
    'no-console': false
  },
  'linterOptions': {
    'exclude': [
      '**/node_modules/**',
    ],
  },
};
