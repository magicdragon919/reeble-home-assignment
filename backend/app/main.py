import os, base64, json
from datetime import timedelta
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from typing import List
from python_anvil.api import Anvil
from python_anvil.api_resources.mutations.create_etch_packet import CreateEtchPacket
from python_anvil.api_resources.payload import (
    EtchSigner,
    SignerField,
    DocumentUpload,
    EtchCastRef,
    SignatureField,
    FillPDFPayload
)
import httpx

from . import crud, models, schemas, deps, security
from .database import engine, SessionLocal

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
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Anvil GraphQL Configuration ---
ANVIL_GRAPHQL_URL = "https://graphql.useanvil.com"
ANVIL_API_KEY = os.getenv("ANVIL_API_KEY")
ANVIL_ORG_EID = os.getenv("ANVIL_ORG_EID")

# Anvil's GraphQL API uses Basic Authentication with your API key as the username.
# We must Base64 encode it.
if ANVIL_API_KEY:
    ANVIL_AUTH_HEADER = {"Authorization": f"Basic {ANVIL_API_KEY}"}
else:
    print("Warning: ANVIL_API_KEY is not set. API calls to Anvil will fail.")
    ANVIL_AUTH_HEADER = {}

anvil = Anvil(api_key=ANVIL_API_KEY)

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
    fileContent = base64.b64encode(await file.read()).decode('utf-8')

    packet = CreateEtchPacket(
        name="Packet Name"
    )
    
    fileID = "testID"
    signatureID = "signatureID"

    signer = EtchSigner(
        name="Test",
        email=current_user.email,
        fields=[SignerField(
            file_id=fileID,
            field_id=signatureID,
        )],
    )

    packet.add_signer(signer)

    fileContent = DocumentUpload(
        id=fileID,
        title="Test form",
        file={"filename": file.filename, "data": fileContent, "mimetype": file.content_type}, 
        fields=[SignatureField(
            id=signatureID,
            type="signature",
            page_num=0,
            # The position and size of the field
            rect=dict(x=100, y=100, width=100, height=100)
        )]
    )

    packet.add_file(fileContent)

    response = anvil.create_etch_packet(payload=packet)
    print(response)
    templateEid = response["createEtchPacket"]["eid"]
    return crud.create_template(db, "Test form", current_user.id, templateEid)

# --- Buyer Flow ---

@app.get("/api/templates", response_model=List[schemas.PDFTemplate], tags=["Buyer"])
def list_available_templates(
    _: models.User = Depends(deps.buyer_only),
    db: Session = Depends(deps.get_db)
):
    """Buyer-only endpoint to get a list of all available templates."""
    return crud.get_templates(db=db)

@app.get("/api/templates/{template_id}/fields", tags=["Buyer"])
def get_template_form_fields(
    template_id: int,
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
        # Get the fields from Anvil to dynamically build the form on the frontend
        fields_response = anvil_client.get_template_fields(db_template.anvil_template_eid)
        return fields_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anvil API error: {str(e)}")


@app.post("/api/templates/{template_id}/submissions", status_code=201, tags=["Buyer"])
def submit_filled_form(
    template_id: int,
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

    try:
        # 1. Submit data to Anvil to fill the PDF
        fill_response = anvil_client.fill_pdf(
            template_eid=db_template.anvil_template_eid,
            data=submission_data,
        )
        
        # 2. Save submission info to our DB
        crud.create_submission(
            db=db,
            template_id=template_id,
            buyer_id=current_user.id,
            anvil_submission_eid=fill_response['submission_eid'],
            filled_pdf_url=fill_response['download_url']
        )
        return {"message": "Submission successful!", "download_url": fill_response['download_url']}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anvil API error: {str(e)}")


# --- Admin Flow ---

@app.get("/api/dashboard", response_model=List[schemas.AdminDashboardTemplate], tags=["Admin"])
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
        latest_submission = crud.get_latest_submission(db, t.id)
        # We use the AdminDashboardTemplate schema which includes nested owner and submission info
        dashboard_item = schemas.AdminDashboardTemplate.from_orm(t)
        dashboard_item.latest_submission = latest_submission
        dashboard_data.append(dashboard_item)
    return dashboard_data