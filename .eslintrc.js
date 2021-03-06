module.exports = {
  env: {
    es2021: true,
  },
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.eslint.json',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    "max-len": ["error", { "code": 140 }]
  },
  settings: {
    "import/resolver": {
      typescript: {}
    },
  },
};
