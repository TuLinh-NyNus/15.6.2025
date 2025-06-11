module.exports = {
  root: true,
  env: {
    node: true,
    browser: false
  },
  extends: [
    '../../.eslintrc.js'
  ],
  overrides: [
    {
      files: ['webpack-hmr.config.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-undef': 'off'
      }
    }
  ]
}; 