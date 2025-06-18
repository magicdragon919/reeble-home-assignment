# Backend Service

FastAPI-based backend service for the Reeble assignment with file upload capabilities and SQLite database.

## Project Structure
```
backend/
├── app/              # Main application directory
├── upload/           # File upload storage directory
├── test.py          # Test files
├── test.db          # SQLite database
└── requirements.txt  # Python dependencies
```

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Setup Instructions

1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   
   # On Windows
   .\venv\Scripts\activate
   
   # On Unix or MacOS
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```

The server will run on `http://localhost:8000`

## Features

- **API Documentation**: Available at `http://localhost:8000/docs`
- **File Upload System**: Handles file uploads in the `upload/` directory
- **Database**: SQLite database (`test.db`)
- **Authentication**: JWT-based authentication system
- **ORM**: SQLAlchemy for database operations

## API Endpoints

Access the interactive API documentation at `http://localhost:8000/docs` for detailed endpoint information.

## Testing

Run the test suite:
```bash
pytest test.py
```

## Dependencies

Key packages:
- FastAPI (0.115.12)
- SQLAlchemy (2.0.41)
- Python-JWT
- Uvicorn
- Python-multipart (for file uploads)

For complete list, see `requirements.txt`

## Important Notes

1. The SQLite database (`test.db`) is used for data persistence
2. Use the `/docs` endpoint for testing API endpoints interactively
3. Server runs in debug mode with auto-reload when using `--reload` flag 