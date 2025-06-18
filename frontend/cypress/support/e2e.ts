import '@testing-library/cypress/add-commands';
import 'cypress-file-upload';
import './commands';

// Prevent TypeScript errors when accessing cy.* commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      attachFile(filePath: string): Chainable<JQuery<HTMLElement>>;
    }
  }
} 