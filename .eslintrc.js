module.exports = {
  extends: ['airbnb-base', 'plugin:jest/recommended', 'prettier'],
  env: {
    node: true,
    jest: true,
  },
  overrides: [
    // only for ts files
    {
      files: ['*.ts'],
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
      extends: ['airbnb-typescript/base', 'plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
  rules: {
    'import/prefer-default-export': 'off',
    'no-plusplus': 'off',
    'no-console': 'off',
  },
};
