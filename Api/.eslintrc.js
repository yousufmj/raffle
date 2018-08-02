module.exports = {
  parser: 'babel-eslint',
  extends: ['airbnb', 'eslint:recommended', 'plugin:react/recommended'],
  plugins: ['react'],
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      modules: true,
      experimentalObjectRestSpread: true,
      allowImportExportEverywhere: false
    }
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    jest: true
  }
};
