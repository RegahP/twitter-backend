const { createDefaultPreset } = require("ts-jest");
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/src/' }),
    '^@prisma/client$': '<rootDir>/src/tests/__mocks__/prisma.ts'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@prisma)/)'
  ],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  preset: 'ts-jest'
};