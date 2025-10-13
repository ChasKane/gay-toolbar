module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^obsidian$": "<rootDir>/src/__mocks__/obsidian.ts",
    "^StateManagement$": "<rootDir>/src/StateManagement.ts",
    "^@atlaskit/pragmatic-drag-and-drop/element/adapter$":
      "<rootDir>/src/__mocks__/drag-and-drop.ts",
    "^../Settings/chooseNewCommand$":
      "<rootDir>/src/__mocks__/chooseNewCommand.ts",
  },
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)",
    "<rootDir>/src/**/?(*.)(spec|test).(ts|tsx|js)",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/setupTests.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
};
