from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from app.models import users_db, User
import jwt
from app.config import SECRET_KEY

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return users_db[username]
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
