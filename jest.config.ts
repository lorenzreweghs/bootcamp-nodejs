import type { InitialOptionsTsJest } from 'ts-jest';

const jestConfig: InitialOptionsTsJest = {
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  preset: 'ts-jest',
  testPathIgnorePatterns: ['dist'],
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};

export default jestConfig;
