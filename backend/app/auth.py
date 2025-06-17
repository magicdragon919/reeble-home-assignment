from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.models import users_db, User
from app.config import SECRET_KEY
import jwt
import datetime

def authenticate_user(username: str, password: str) -> User:
    if username in users_db and users_db[username]["password"] == password:
        return User(username=username, role=users_db[username]["role"])
    return None

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    return encoded_jwt

def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

