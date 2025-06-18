declare namespace Cypress {
  interface Chainable {
    login(email: string, password: string): Chainable<void>
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('http://localhost:5173');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
}); 