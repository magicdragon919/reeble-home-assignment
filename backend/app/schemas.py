from pydantic import BaseModel, validator
from typing import List, Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserBase(BaseModel):
    email: str
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    class Config:
        orm_mode = True

class Submission(BaseModel):
    id: int
    buyer_id: int
    filled_pdf_url: Optional[str] = None
    class Config:
        orm_mode = True

class PDFTemplateBase(BaseModel):
    title: str

class PDFTemplate(PDFTemplateBase):
    id: int
    title: str
    owner_id: int
    anvil_template_eid: str
    class Config:
        orm_mode = True

class AdminDashboardTemplate(PDFTemplate):
    owner: User
    latest_submission: Optional[Submission] = None

class PdfBase64Request(BaseModel):
    filename: str
    pdf_content_base64: str

    @validator('filename')
    def validate_filename(cls, v):
        if '..' in v or '/' in v or '\\' in v:
            raise ValueError('Invalid filename.')
        if not v.lower().endswith('.pdf'):
            raise ValueError('Filename must have a .pdf extension.')
        return v