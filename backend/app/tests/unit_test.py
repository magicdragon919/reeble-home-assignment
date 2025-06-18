import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from unittest.mock import patch, Mock
import io

# --- FIX START: Robust Path Correction ---
# This ensures that the 'backend' directory (the project root containing 'app')
# is on the Python path, allowing absolute imports like `from app.main import ...`.
import sys
import os
# Go up two levels from the current file's directory (tests -> app -> backend)
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, PROJECT_ROOT)
# --- FIX END ---

from app.main import app
from app.database import Base
from app.deps import get_db
from app import models, security, crud, schemas

# --- Test Database Setup ---
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

# --- FIX START: Use StaticPool for in-memory DB ---
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool, # This ensures the same connection is used across the test
)
# --- FIX END ---

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Apply the dependency override to the app instance
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

# --- Test Fixtures ---
@pytest.fixture(scope="function")
def db_session():
    """
    Creates a new, clean database session with seeded users for each test function.
    """
    Base.metadata.create_all(bind=engine)  # Create tables
    db = TestingSessionLocal()
    try:
        # Manually seed the database for test isolation
        default_password = "password123"
        users_to_create = [
            schemas.UserCreate(email="agent@test.io", role="Agent", password=default_password),
            schemas.UserCreate(email="buyer@test.io", role="Buyer", password=default_password),
            schemas.UserCreate(email="admin@test.io", role="Admin", password=default_password),
        ]
        for user_in in users_to_create:
            crud.create_user(db, user_in)
        
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine) # Clean up

@pytest.fixture(scope="function")
def test_client(db_session):
    """Provides the TestClient, ensuring the db is set up."""
    return client

# --- User Fixtures ---
@pytest.fixture
def agent_user(db_session):
    return crud.get_user_by_email(db_session, email="agent@test.io")

@pytest.fixture
def buyer_user(db_session):
    return crud.get_user_by_email(db_session, email="buyer@test.io")

@pytest.fixture
def admin_user(db_session):
    return crud.get_user_by_email(db_session, email="admin@test.io")

@pytest.fixture
def template_fixture(db_session, agent_user):
    """Creates a test template and returns it"""
    template = crud.create_template(db_session, "test_template.pdf", agent_user.id, "test_template_eid")
    db_session.commit()
    return template

@pytest.fixture
def submission_fixture(db_session, template_fixture, buyer_user):
    """Creates a test submission and returns it"""
    submission = models.Submission(
        template_id=template_fixture.anvil_template_eid,  # Use anvil_template_eid instead of id
        buyer_id=buyer_user.id,
        anvil_submission_eid="test_submission_eid",
        filled_pdf_url="http://example.com/test.pdf"
    )
    db_session.add(submission)
    db_session.commit()
    return submission


# ==================================
# ===      TESTS START HERE      ===
# ==================================

class TestAuthentication:
    def test_login_for_access_token_success(self, test_client, db_session):
        response = test_client.post("/api/token", data={"username": "admin@test.io", "password": "password123"})
        assert response.status_code == 200
        assert "access_token" in response.json()
        assert response.json()["token_type"] == "bearer"

    def test_login_for_access_token_failure(self, test_client, db_session):
        response = test_client.post("/api/token", data={"username": "admin@test.io", "password": "wrongpassword"})
        assert response.status_code == 401
        assert response.json()["detail"] == "Incorrect email or password"

    def test_login_nonexistent_user(self, test_client, db_session):
        response = test_client.post("/api/token", data={"username": "nonexistent@test.io", "password": "password123"})
        assert response.status_code == 401
        assert response.json()["detail"] == "Incorrect email or password"

    def test_read_users_me(self, test_client, admin_user):
        token = security.create_access_token(data={"sub": admin_user.email, "role": admin_user.role})
        response = test_client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert response.json()["email"] == admin_user.email
        assert response.json()["role"] == admin_user.role

    def test_read_users_me_invalid_token(self, test_client):
        response = test_client.get("/api/users/me", headers={"Authorization": "Bearer invalid_token"})
        assert response.status_code == 401
        assert response.json()["detail"] == "Could not validate credentials"


class TestAgentFlow:
    @patch('app.main.create_cast')
    def test_upload_template_success(self, mock_create_cast, test_client, agent_user):
        mock_create_cast.return_value = {"data": {"createCast": {"eid": "mockCastEid123"}}}
        token = security.create_access_token(data={"sub": agent_user.email, "role": agent_user.role})
        
        # Create a BytesIO object with PDF-like content
        pdf_content = io.BytesIO(b"%PDF-1.4\n%TEST PDF CONTENT")
        
        response = test_client.post(
            "/api/templates", 
            headers={"Authorization": f"Bearer {token}"}, 
            files={"file": ("test.pdf", pdf_content, "application/pdf")}
        )
        assert response.status_code == 201
        assert response.json()["anvil_template_eid"] == "mockCastEid123"
        assert response.json()["title"] == "test.pdf"

    def test_upload_template_unauthorized(self, test_client, buyer_user):
        token = security.create_access_token(data={"sub": buyer_user.email, "role": buyer_user.role})
        
        # Create a BytesIO object with PDF-like content
        pdf_content = io.BytesIO(b"%PDF-1.4\n%TEST PDF CONTENT")
        
        response = test_client.post(
            "/api/templates", 
            headers={"Authorization": f"Bearer {token}"}, 
            files={"file": ("test.pdf", pdf_content, "application/pdf")}
        )
        assert response.status_code == 403
        assert "Operation not permitted" in response.json()["detail"]

    def test_list_agent_templates(self, test_client, agent_user, db_session):
        # Create a template for the agent
        crud.create_template(db_session, "agent_template.pdf", agent_user.id, "agent_eid")
        db_session.commit()
        token = security.create_access_token(data={"sub": agent_user.email, "role": agent_user.role})
        response = test_client.get("/api/templates", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]['title'] == 'agent_template.pdf'
        assert response.json()[0]['anvil_template_eid'] == 'agent_eid'

    def test_list_agent_templates_empty(self, test_client, agent_user):
        token = security.create_access_token(data={"sub": agent_user.email, "role": agent_user.role})
        response = test_client.get("/api/templates", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert len(response.json()) == 0


class TestBuyerFlow:
    @patch('app.main.get_cast')
    def test_get_template_form_fields(self, mock_get_cast, test_client, buyer_user, template_fixture):
        mock_get_cast.return_value = {"fieldInfo": {"fields": [{"id": "field1", "type": "text"}]}}
        token = security.create_access_token(data={"sub": buyer_user.email, "role": buyer_user.role})
        response = test_client.get(
            f"/api/templates/{template_fixture.anvil_template_eid}/fields",  # Use anvil_template_eid
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert "fields" in response.json()
        assert len(response.json()["fields"]) == 1
        assert response.json()["fields"][0]["id"] == "field1"

    def test_get_template_form_fields_not_found(self, test_client, buyer_user):
        token = security.create_access_token(data={"sub": buyer_user.email, "role": buyer_user.role})
        response = test_client.get(
            "/api/templates/nonexistent_eid/fields",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Template not found"

    @patch('app.main.upload_pdf')
    @patch('app.main.create_etch_packet')
    @patch('app.main.submit_filled_pdf')
    def test_submit_filled_form(self, mock_submit, mock_etch, mock_upload, test_client, buyer_user, template_fixture):
        mock_submit.return_value = b"filled content"
        mock_etch.return_value = {"createEtchPacket": {"eid": "etch123", "detailsURL": "url"}}
        token = security.create_access_token(data={"sub": buyer_user.email, "role": buyer_user.role})
        response = test_client.post(
            f"/api/templates/{template_fixture.anvil_template_eid}/submissions",  # Use anvil_template_eid
            headers={"Authorization": f"Bearer {token}"}, 
            json={"field1": "value1"}
        )
        assert response.status_code == 201
        assert response.json()["submission"]["anvil_submission_eid"] == "etch123"
        assert response.json()["message"] == "Submission successful!"

    def test_list_available_templates_for_buyer(self, test_client, buyer_user, agent_user, db_session):
        crud.create_template(db_session, "template1.pdf", agent_user.id, "eid1")
        crud.create_template(db_session, "template2.pdf", agent_user.id, "eid2")
        db_session.commit()
        token = security.create_access_token(data={"sub": buyer_user.email, "role": buyer_user.role})
        response = test_client.get("/api/templates/available", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert len(response.json()) == 2
        template_titles = [t["title"] for t in response.json()]
        assert "template1.pdf" in template_titles
        assert "template2.pdf" in template_titles


class TestAdminAndDownloadFlow:
    def test_get_admin_dashboard(self, test_client, admin_user, template_fixture, submission_fixture):
        token = security.create_access_token(data={"sub": admin_user.email, "role": admin_user.role})
        response = test_client.get("/api/dashboard", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        assert len(response.json()) == 1
        assert response.json()[0]["template"]["title"] == "test_template.pdf"
        assert response.json()[0]["latest_submission"]["anvil_submission_eid"] == "test_submission_eid"

    def test_get_admin_dashboard_unauthorized(self, test_client, buyer_user):
        token = security.create_access_token(data={"sub": buyer_user.email, "role": buyer_user.role})
        response = test_client.get("/api/dashboard", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 403
        assert "Operation not permitted" in response.json()["detail"]

    @patch('app.main.get_pdf_path')
    def test_download_pdf_authorized(self, mock_get_path, test_client, admin_user, agent_user, buyer_user, submission_fixture):
        # Create a temporary file for testing
        dummy_path = "test_dummy.pdf"
        with open(dummy_path, "wb") as f:
            f.write(b"fake pdf")
        mock_get_path.return_value = dummy_path

        # Test download as Admin
        admin_token = security.create_access_token(data={"sub": admin_user.email, "role": admin_user.role})
        response = test_client.get(
            f"/api/submissions/{submission_fixture.anvil_submission_eid}/download",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        assert response.content == b"fake pdf"

        # Test download as Agent (Owner)
        agent_token = security.create_access_token(data={"sub": agent_user.email, "role": agent_user.role})
        response = test_client.get(
            f"/api/submissions/{submission_fixture.anvil_submission_eid}/download",
            headers={"Authorization": f"Bearer {agent_token}"}
        )
        assert response.status_code == 200

        # Test download as Buyer
        buyer_token = security.create_access_token(data={"sub": buyer_user.email, "role": buyer_user.role})
        response = test_client.get(
            f"/api/submissions/{submission_fixture.anvil_submission_eid}/download",
            headers={"Authorization": f"Bearer {buyer_token}"}
        )
        assert response.status_code == 200
        
        os.remove(dummy_path)

    def test_download_pdf_unauthorized(self, test_client, submission_fixture, db_session):
        # Create a new, unrelated user
        unauthorized_user = crud.create_user(
            db_session, 
            schemas.UserCreate(email="unauthorized@test.io", role="Buyer", password="pw")
        )
        db_session.commit()
        token = security.create_access_token(data={"sub": unauthorized_user.email, "role": unauthorized_user.role})
        response = test_client.get(
            f"/api/submissions/{submission_fixture.anvil_submission_eid}/download",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403
        assert "not authorized" in response.json()["detail"].lower()

    def test_download_pdf_not_found(self, test_client, admin_user):
        token = security.create_access_token(data={"sub": admin_user.email, "role": admin_user.role})
        response = test_client.get(
            "/api/submissions/nonexistent/download",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Submission not found"
