# Reeble Assignment

This project consists of a frontend and backend application. Follow the instructions below to set up and run the project.

## Prerequisites

- Python 3.8 or higher (for backend)
- Node.js (v14 or higher) (for frontend)
- pip (Python package manager)
- npm or yarn
- Git

## Quick Start with Docker (Recommended)

The easiest way to run the project is using Docker and Docker Compose.

### Prerequisites for Docker
- Docker installed on your system
- Docker Compose installed on your system
- Anvil API key (optional, for full functionality)

### Running with Docker

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone [<repository-url>](https://github.com/magicdragon919/reeble-home-assignment)
   cd reeble_assignment
   ```

2. **Set up environment variables** (optional):
   Create a `.env` file in the root directory:
   ```bash
   ANVIL_API_KEY=your-anvil-api-key-here
   ```

3. **Build and run the application**:
   ```bash
   docker-compose up --build
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Docker Commands

```bash
# Start the application
docker-compose up

# Start in background
docker-compose up -d

# Stop the application
docker-compose down

# Rebuild containers
docker-compose up --build

# View logs
docker-compose logs

# Clean up everything
docker-compose down -v --rmi all
```

### Default Users (Created Automatically)
- **Agent**: agent@test.io / password123
- **Buyer**: buyer@test.io / password123
- **Admin**: admin@test.io / password123

**Note**: Change these passwords in production!

## Installation (Manual Setup)

If you prefer to run the application without Docker, follow these manual setup instructions.

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

4. Copy the .env.example file to .env and replace the environment variables.

5. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
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
3. Copy the .env.example file to .env and replace the environment variables.

4. Start the frontend development server:
   ```bash
   npm run dev
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
- [x] JWT Authentication
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
- [x] Docker setup
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
