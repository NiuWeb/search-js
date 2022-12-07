/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@src/(.*)': "<rootDir>/src/$1",
    '^@core/(.*)': "<rootDir>/src/core/$1",
  },
};