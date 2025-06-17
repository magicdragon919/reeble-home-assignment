from pydantic import BaseModel
from typing import Dict

# Hardcoded user data (replace with a proper DB for production)
users_db: Dict[str, dict] = {
    "agent@test.io": {
        "username": "agent@test.io",
        "password": "agentpassword",  # In production, store hashed passwords
        "role": "agent"
    },
    "buyer@test.io": {
        "username": "buyer@test.io",
        "password": "buyerpassword",
        "role": "buyer"
    },
    "admin@test.io": {
        "username": "admin@test.io",
        "password": "adminpassword",
        "role": "admin"
    }
}

# Pydantic model to represent a User
class User(BaseModel):
    username: str
    role: str
