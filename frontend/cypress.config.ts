const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: true,
    experimentalRunAllSpecs: true,
    experimentalModifyObstructiveThirdPartyCode: true,
    defaultCommandTimeout: 10000,
    setupNodeEvents(on, config) {
      // Set environment variables for test
      process.env.NODE_ENV = 'test';
      config.env.NODE_ENV = 'test';
      return config;
    },
  },
  env: {
    apiUrl: 'http://localhost:3000',
    NODE_ENV: 'test'
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
}); 