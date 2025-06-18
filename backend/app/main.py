from datetime import timedelta
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from typing import List

import io

from . import crud, models, schemas, deps, security
from .database import engine, SessionLocal
from .service.anvil_service import *
from .service.graphql_service import *
from .service.file_service import *

# --- FastAPI App Initialization ---

# Load environment variables from .env file
load_dotenv()

# Create database tables based on SQLAlchemy models
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Reeble Smart PDF Workflow API",
    description="API for managing PDF templates and submissions with JWT authentication.",
    version="1.0.0",
)

# CORS (Cross-Origin Resource Sharing) Middleware
# Allows the React frontend (running on localhost:3000) to communicate with this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    """Seed the database with default users on application startup."""
    db = SessionLocal()
    # A default password for all seeded users for easy testing.
    default_password = "password123" 
    
    users = [
        schemas.UserCreate(email="agent@test.io", role="Agent", password=default_password),
        schemas.UserCreate(email="buyer@test.io", role="Buyer", password=default_password),
        schemas.UserCreate(email="admin@test.io", role="Admin", password=default_password),
    ]
    
    for user_in in users:
        user = crud.get_user_by_email(db, email=user_in.email)
        if not user:
            crud.create_user(db, user_in)
            print(f"Created user: {user_in.email} with password: {default_password}")
    db.close()


# --- Authentication Endpoints ---

@app.post("/api/token", response_model=schemas.Token, tags=["Authentication"])
async def login_for_access_token(
    db: Session = Depends(deps.get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    Authenticate user and return a JWT access token.
    FastAPI's OAuth2PasswordRequestForm requires the client to send a form with `username` and `password`.
    """
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/users/me", response_model=schemas.User, tags=["Users"])
async def read_users_me(current_user: models.User = Depends(deps.get_current_user)):
    """Fetch the current authenticated user's details."""
    return current_user


# --- Agent Flow ---

@app.post("/api/templates", response_model=schemas.PDFTemplate, status_code=201, tags=["Agent"])
async def upload_template(
    current_user: models.User = Depends(deps.agent_only),
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db)
):
    """
    Agent-only endpoint to upload a PDF, convert it to an Anvil template,
    and save its metadata to the database.
    """
    file_content = await file.read()

    response = create_cast(file_content=file_content, filename=file.filename)
    castEid = response["data"]["createCast"]["eid"]

    return crud.create_template(db, file.filename, current_user.id, castEid)

@app.get("/api/templates", tags=["Agent"])
def list_available_templates(
    current_user: models.User = Depends(deps.agent_only),
    db: Session = Depends(deps.get_db)
):
    """Agent-only endpoint to get a list of their templates."""
    return crud.get_templates_by_user(db, current_user.id)


# --- Buyer Flow ---

@app.get("/api/templates/available", response_model=List[schemas.PDFTemplate], tags=["Buyer"])
def list_available_templates(
    _: models.User = Depends(deps.buyer_only),
    db: Session = Depends(deps.get_db)
):
    """Buyer-only endpoint to get a list of all available templates."""
    return crud.get_templates(db=db)

@app.get("/api/templates/{template_id}/fields", tags=["Buyer"])
def get_template_form_fields(
    template_id: str,
    _: models.User = Depends(deps.buyer_only),
    db: Session = Depends(deps.get_db)
):
    """
    Buyer-only endpoint to get the dynamic form fields for a specific template.
    """
    db_template = crud.get_template(db, template_id)
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")

    try:
        # Retrieve cast data from Anvil
        cast_data = get_cast(anvil_template_eid=db_template.anvil_template_eid)
        fields = cast_data.get("fieldInfo", {}).get("fields", [])
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch data from Anvil: {str(e)}")

    return { "fields": fields }

@app.post("/api/templates/{template_id}/submissions", status_code=201, tags=["Buyer"])
def submit_filled_form(
    template_id: str,
    submission_data: dict,
    current_user: models.User = Depends(deps.buyer_only),
    db: Session = Depends(deps.get_db)
):
    """
    Buyer-only endpoint to submit data for a form, fill the PDF via Anvil,
    and record the submission.
    """
    db_template = crud.get_template(db, template_id)
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")

    fill_response = submit_filled_pdf(submission_data, db_template)
    
    response = create_etch_packet(file_content=fill_response, current_user=current_user)

    submission = crud.create_submission(db=db, template_id=template_id, buyer_id=current_user.id, anvil_submission_eid=response["createEtchPacket"]["eid"], filled_pdf_url=response["createEtchPacket"]["detailsURL"])
    filename = f"{response['createEtchPacket']['eid']}.pdf"
    upload_pdf(filename=filename, file_content=fill_response)
    return {"message": "Submission successful!", "submission": submission }

    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=f"Anvil API error: {str(e)}")

@app.get("/api/submissions", tags=["Buyer"])
def list_available_templates(
    current_user: models.User = Depends(deps.buyer_only),
    db: Session = Depends(deps.get_db)
):
    """Buyer-only endpoint to get a list of their submissions."""
    return crud.get_submissions_by_user(db, current_user.id)



# --- Admin Flow ---

@app.get("/api/dashboard", tags=["Admin"])
def get_admin_dashboard(
    _: models.User = Depends(deps.admin_only),
    db: Session = Depends(deps.get_db)
):
    """
    Admin-only endpoint to view a dashboard listing every template, its owner,
    the latest buyer submission, and a download link for the filled PDF.
    """
    templates = crud.get_templates(db)
    dashboard_data = []
    for t in templates:
        latest_submission = crud.get_latest_submission(db, t.anvil_template_eid)
        template_data = { "owner": t.owner, "template": t, "latest_submission": latest_submission }
        dashboard_data.append(template_data)
    return dashboard_data

@app.get("/api/submissions/{submission_id}/download")
async def download_submission_pdf(
    submission_id: str,
    current_user: models.User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """
    Download the filled PDF for a given submission.
    
    This endpoint is accessible by:
    1. The Buyer who created the submission.
    2. The Agent who owns the parent template.
    3. Any user with the Admin role.
    """

    submission = crud.get_submission_by_id(db=db, submission_id=submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    template = crud.get_template(db, template_id=submission.template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Associated template not found")
    
    is_buyer = submission.buyer_id == current_user.id
    is_owner = template.owner_id == current_user.id
    is_admin = current_user.role == "Admin"

    if not (is_buyer or is_owner or is_admin):
        raise HTTPException(status_code=403, detail="You are not authorized to download this file")

    pdf_path = get_pdf_path(submission_eid=submission.anvil_submission_eid)

    return FileResponse(path=pdf_path, media_type='application/pdf', filename=f"{submission.anvil_submission_eid}.pdf")