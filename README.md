# Reeble Assignment

This project consists of a frontend and backend application. Follow the instructions below to set up and run the project.

## Prerequisites

- Python 3.8 or higher (for backend)
- Node.js (v14 or higher) (for frontend)
- pip (Python package manager)
- npm or yarn
- Git

## Installation

### Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv venv
   # On Windows
   .\venv\Scripts\activate
   # On Unix or MacOS
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

The backend server should now be running on `http://localhost:8000` with API documentation available at `http://localhost:8000/docs`.

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

The frontend application should now be running on `http://localhost:5173` and automatically open in your default browser.

## Development

- Backend API endpoints are accessible at `http://localhost:8000/api`
- Interactive API documentation is available at `http://localhost:8000/docs`
- Frontend development server includes hot-reloading for real-time updates
- Check respective package.json and requirements.txt files for additional dependencies

For more detailed information, refer to the documentation in the frontend and backend directories.

## TODO Lists

### MVP Version (Priority Features)

#### Backend Essentials
- [ ] JWT Authentication
  > Basic user authentication and authorization
- [ ] File upload validation
  > Secure file upload with size and type checks
- [ ] Basic database indexing
  > Improve core query performance
- [ ] Error handling
  > Standardized error responses

#### Signature & Document Workflow
- [ ] Anvil API Integration
  > Connect with Anvil's e-sign service
- [ ] PDF Generation
  > Create fillable PDF documents
- [ ] Signature Request Flow
  > Handle document signing workflow
- [ ] Email Notifications
  > Alert users about signature requests
- [ ] Signature Verification
  > Validate and store signatures
- [ ] Document Status Tracking
  > Monitor document signing progress

#### Frontend Essentials
- [ ] Responsive design
  > Basic mobile and desktop support
- [ ] File upload UI
  > Simple and functional upload interface
- [ ] Progress indicators
  > Show operation status to users
- [ ] Signature Interface
  > Clean UI for document signing
- [ ] Document Status Dashboard
  > View and track document statuses
- [ ] Signature Request Management
  > Create and manage signature requests

### Future Version (Scale & Enhancement)

#### Advanced Backend
- [ ] Two-factor authentication
  > Enhanced security
- [ ] Cloud storage
  > Scalable file storage
- [ ] Redis caching
  > Performance optimization
- [ ] PostgreSQL migration
  > Better database scalability

#### Advanced Frontend
- [ ] Dark/light theme
  > User preference options
- [ ] Drag-and-drop
  > Enhanced file upload
- [ ] Offline support
  > Basic functionality without internet

#### Infrastructure
- [ ] Docker setup
  > Consistent environments
- [ ] CI/CD pipeline
  > Automated deployment
- [ ] Monitoring
  > System health tracking

#### Business Features
- [ ] Analytics
  > User behavior tracking
- [ ] GDPR compliance
  > Data protection
- [ ] Multi-language
  > International support

Note: 
- MVP: Focus on core functionality and signature workflow
- Future: Scale and enhance based on feedback 