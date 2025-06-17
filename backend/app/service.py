from fastapi import UploadFile, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
import requests
from dotenv import load_dotenv
from python_anvil.api import Anvil
import os, json, base64, jwt

from app.models import users_db, User
from app.config import SECRET_KEY

load_dotenv()

ANVIL_DEV_API_KEY = os.getenv("ANVIL_DEV_KEY")

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

if not ANVIL_DEV_API_KEY:
    raise ValueError("ANVIL_API_KEY environment variable not set.")

# Anvil's GraphQL endpoint
ANVIL_API_URL = "https://app.useanvil.com/api/v1/graphql"

# The GraphQL query for creating a template from a file upload
# The variables `$title` and `$files` are defined here
CREATE_TEMPLATE_MUTATION = """
    mutation CreatePdfTemplate($title: String, $files: [Upload!]!) {
      createPdfTemplate(title: $title, files: $files) {
        eid
        name
        createdAt
      }
    }
"""

anvil = Anvil(api_key=ANVIL_DEV_API_KEY)

async def convert_pdf_to_anvil(file: UploadFile):
    print("Dev Key: ", ANVIL_DEV_API_KEY)
    encodedToken = base64.b64decode(ANVIL_DEV_API_KEY)
    headers = {
        # The API Key is sent as a Basic Auth username, with an empty password
        "Authorization": f"Basic {encodedToken}:"
    }

    # Construct the multipart form data according to GraphQL specs
    form_data = {
        'operations': (None, json.dumps({
            'query': CREATE_TEMPLATE_MUTATION,
            'variables': {
                'title': f"Direct API Upload: {file.filename}",
                'files': [None]  # Placeholder for the file
            }
        })),
        'map': (None, json.dumps({
            '0': ['variables.files.0'] # Maps the file to the placeholder
        })),
        # The key '0' here corresponds to the file mapping above
        '0': (file.filename, await file.read(), 'application/pdf')
    }

    response = requests.post(ANVIL_API_URL, headers=headers, files=form_data)
    response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)

    response_json = response.json()

    print(response_json)
