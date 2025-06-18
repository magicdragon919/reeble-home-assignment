import os
from fastapi import HTTPException

STORAGE_PATH = os.path.abspath(os.getenv("PDF_STORAGE_PATH"))
os.makedirs(STORAGE_PATH, exist_ok=True)

def upload_pdf(filename: str, file_content: str):
    # Define the file path and save the decoded PDF
    file_location = os.path.join(STORAGE_PATH, filename)

    # Basic security check to prevent writing files outside the storage directory
    if not os.path.abspath(file_location).startswith(os.path.abspath(STORAGE_PATH)):
        raise HTTPException(status_code=400, detail="Invalid filename causing directory traversal.")

    try:
        with open(file_location, "wb") as file_object:
            file_object.write(file_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while saving the file: {e}")

    return {"info": f"File '{filename}' saved successfully at '{file_location}'"}

def get_pdf_path(submission_eid: str):
    return os.path.join(STORAGE_PATH, f"{submission_eid}.pdf")