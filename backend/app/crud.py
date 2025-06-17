# backend/app/crud.py
from sqlalchemy.orm import Session
from . import models, schemas
from .security import get_password_hash

# User Functions
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserBase):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(email=user.email, role=user.role, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Template Functions
def create_template(db: Session, title: str, owner_id: int, anvil_template_eid: str):
    db_template = models.PDFTemplate(title=title, owner_id=owner_id, anvil_template_eid=anvil_template_eid)
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

def get_templates(db: Session):
    return db.query(models.PDFTemplate).all()

def get_template(db: Session, template_id: int):
    return db.query(models.PDFTemplate).filter(models.PDFTemplate.id == template_id).first()

# Submission Functions
def create_submission(db: Session, template_id: int, buyer_id: int, anvil_submission_eid: str, filled_pdf_url: str):
    db_submission = models.Submission(
        template_id=template_id,
        buyer_id=buyer_id,
        anvil_submission_eid=anvil_submission_eid,
        filled_pdf_url=filled_pdf_url
    )
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    return db_submission

def get_latest_submission(db: Session, template_id: int):
    return db.query(models.Submission).filter(models.Submission.template_id == template_id).order_by(models.Submission.id.desc()).first()