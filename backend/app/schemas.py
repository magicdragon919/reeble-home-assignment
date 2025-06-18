from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class PDFTemplateBase(BaseModel):
    title: str
    anvil_template_eid: str

class PDFTemplate(PDFTemplateBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SubmissionBase(BaseModel):
    template_id: str
    anvil_submission_eid: str
    filled_pdf_url: Optional[str] = None

class Submission(SubmissionBase):
    id: int
    buyer_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class AdminDashboardTemplate(PDFTemplate):
    owner: User
    latest_submission: Optional[Submission] = None
