const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Points to your Next.js app so Jest can load next.config.js and .env files
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterFramework: ["<rootDir>/jest.setup.js"],
  testEnvironment: "node",
  moduleNameMapper: {
    // Support the @/ alias you use throughout the project
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  // Only pick up .test.ts / .test.tsx files
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
};

module.exports = createJestConfig(customJestConfig);