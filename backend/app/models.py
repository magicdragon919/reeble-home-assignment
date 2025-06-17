from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(String) # "Agent", "Buyer", "Admin"
    hashed_password = Column(String)

class PDFTemplate(Base):
    __tablename__ = "templates"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    anvil_template_eid = Column(String, unique=True)

    owner = relationship("User")
    submissions = relationship("Submission", back_populates="template")


class Submission(Base):
    __tablename__ = "submissions"
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("templates.id"))
    buyer_id = Column(Integer, ForeignKey("users.id"))
    anvil_submission_eid = Column(String, unique=True)
    filled_pdf_url = Column(String, nullable=True)

    template = relationship("PDFTemplate", back_populates="submissions")
    buyer = relationship("User")