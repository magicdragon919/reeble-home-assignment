describe('Reeble Assignment E2E Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  describe('Agent Flow', () => {
    it('should login as agent and test dashboard', () => {
      // Set up API mocks before navigation
      cy.intercept('POST', 'http://localhost:8000/api/token', {
        statusCode: 200,
        body: { access_token: 'agent_test_token' }
      }).as('login');

      cy.intercept('GET', 'http://localhost:8000/api/users/me', {
        statusCode: 200,
        body: {
          id: '1',
          email: 'agent@test.io',
          role: 'Agent'
        }
      }).as('getUser');

      cy.intercept('GET', 'http://localhost:8000/api/templates', {
        statusCode: 200,
        body: {
          templates: [{
            id: 'template1',
            title: 'Test Template',
            created_at: '2024-01-01',
            updated_at: '2024-01-01'
          }]
        }
      }).as('getTemplates');

      // Login as agent
      cy.visit('/login');
      cy.get('input[name="email"]').clear().type('agent@test.io');
      cy.get('input[name="password"]').clear().type('password123');
      cy.get('button[type="submit"]').click();
      
      cy.wait('@login');
      cy.wait('@getUser');
      cy.url().should('include', '/dashboard');
      cy.contains('Template Management').should('be.visible');
      cy.wait('@getTemplates');

      // Test template upload
      cy.contains('Upload New Template').click();
      cy.get('input[type="file"]').attachFile('template.pdf');
      
      // Mock upload response
      cy.intercept('POST', 'http://localhost:8000/api/templates', {
        statusCode: 200,
        body: {
          template: {
            id: 'template2',
            title: 'New Test Template',
            created_at: '2024-01-01',
            updated_at: '2024-01-01'
          }
        }
      }).as('uploadTemplate');

      // Wait for file to be processed
      cy.wait(1000);
      cy.contains('button', 'Upload').click();
      cy.wait('@uploadTemplate');

      // Click Cancel button to close the modal
      cy.contains('button', 'Cancel').click();

      // Mock templates refresh after upload
      cy.intercept('GET', 'http://localhost:8000/api/templates', {
        statusCode: 200,
        body: []
      }).as('getTemplatesAfterUpload');
    });
  });

  describe('Buyer Flow', () => {
    it('should login as buyer and test dashboard', () => {
      // Set up API mocks before navigation
      cy.intercept('POST', 'http://localhost:8000/api/token', {
        statusCode: 200,
        body: { access_token: 'buyer_test_token' }
      }).as('login');

      cy.intercept('GET', 'http://localhost:8000/api/users/me', {
        statusCode: 200,
        body: {
          id: '1',
          email: 'buyer@test.io',
          role: 'Buyer'
        }
      }).as('getUser');

      cy.intercept('GET', 'http://localhost:8000/api/submissions', {
        statusCode: 200,
        body: []
      }).as('getSubmissions');

      // Login as buyer
      cy.visit('/login');
      cy.get('input[name="email"]').clear().type('buyer@test.io');
      cy.get('input[name="password"]').clear().type('password123');
      cy.get('button[type="submit"]').click();
      
      cy.wait('@login');
      cy.wait('@getUser');
      cy.url().should('include', '/dashboard');
      cy.contains('Buyer Dashboard').should('be.visible');
      cy.wait(['@getSubmissions']);
      
      // Mock form submission
      cy.intercept('POST', 'http://localhost:8000/api/templates/*/submissions', {
        statusCode: 200,
        body: []
      }).as('submitForm');
    });
  });

  describe('Admin Flow', () => {
    it('should login as admin and test dashboard', () => {
      // Set up API mocks before navigation
      cy.intercept('POST', 'http://localhost:8000/api/token', {
        statusCode: 200,
        body: { access_token: 'admin_test_token' }
      }).as('login');

      cy.intercept('GET', 'http://localhost:8000/api/users/me', {
        statusCode: 200,
        body: {
          id: '1',
          email: 'admin@test.io',
          role: 'Admin'
        }
      }).as('getUser');

      cy.intercept('GET', 'http://localhost:8000/api/dashboard', {
        statusCode: 200,
        body: {
          data: {
            templates: [{
              template: {
                id: 'template1',
                title: 'Test Template'
              },
              owner: {
                email: 'agent@test.io'
              },
              latest_submission: {
                created_at: '2024-01-01',
                filled_pdf_url: '/test.pdf',
                anvil_submission_eid: 'submission1'
              }
            }]
          }
        }
      }).as('getDashboard');

      // Login as admin
      cy.visit('/login');
      cy.get('input[name="email"]').clear().type('admin@test.io');
      cy.get('input[name="password"]').clear().type('password123');
      cy.get('button[type="submit"]').click();
      
      cy.wait('@login');
      cy.wait('@getUser');
      cy.url().should('include', '/dashboard');
      cy.contains('Admin Dashboard').should('be.visible');
      cy.wait('@getDashboard');

      // Test desktop view
      cy.viewport(1200, 800);
      cy.contains('Test Template').should('be.visible');
      
      // Test mobile view
      cy.viewport(375, 667);
      cy.contains('Test Template').should('be.visible');

      // Test PDF download
      cy.intercept('GET', 'http://localhost:8000/api/submissions/*/download', {
        statusCode: 200,
        body: 'PDF content'
      }).as('downloadPDF');

      cy.contains('button', 'Download').first().click();
      cy.wait('@downloadPDF');
    });
  });

  describe('Invalid Login', () => {
    it('should show error on invalid credentials', () => {
      cy.intercept('POST', 'http://localhost:8000/api/token', {
        statusCode: 401,
        body: { detail: 'Invalid credentials' }
      }).as('loginFailed');

      cy.visit('/login');
      cy.get('input[name="email"]').clear().type('wrong@email.com');
      cy.get('input[name="password"]').clear().type('wrongpass');
      cy.get('button[type="submit"]').click();
      cy.wait('@loginFailed');
      cy.contains('Failed to log in').should('be.visible');
      cy.url().should('include', '/login');
    });
  });
}); 