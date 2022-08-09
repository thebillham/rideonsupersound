// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ['node_modules', __dirname],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testEnvironment: 'jest-environment-jsdom',
  testURL: 'http://localhost:8080',
  // roots: ['<rootDir>/.'],
  // transform: {
  //   '^.+\\.tsx?$': 'ts-jest',
  // },
  moduleNameMapper: {
    'node_modules/(.*)': '<rootDir>/node_modules/$1',
    './(.*)$/': '<rootDir>/$1',
    '@components/(.*)': '<rootDir>/components/$1',
    '@lib/(.*)': '<rootDir>/lib/$1',
    '@features/(.*)': '<rootDir>/features/$1',
    '@views/(.*)': '<rootDir>/views/$1',
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
