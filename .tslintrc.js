module.exports = {
  'extends': [
    '@ridi/tslint-config',
    'tslint-config-prettier',
  ],
  'rules': {
    'no-console': false,
    'semicolon': [true, 'always']
  },
  'linterOptions': {
    'exclude': [
      '**/node_modules/**',
    ],
  },
};
