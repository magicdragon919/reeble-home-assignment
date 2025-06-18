from python_anvil.api import Anvil
from python_anvil.api_resources.mutations.create_etch_packet import CreateEtchPacket
from python_anvil.api_resources.payload import (
    EtchSigner,
    SignerField,
    DocumentUpload,
    SignatureField,
)
import os, base64

# --- Anvil GraphQL Configuration ---
ANVIL_GRAPHQL_URL = "https://graphql.useanvil.com"
ANVIL_API_KEY = os.getenv("ANVIL_API_KEY")

# Anvil's GraphQL API uses Basic Authentication with your API key as the username.
# We must Base64 encode it.
if ANVIL_API_KEY:
    ANVIL_AUTH_HEADER = {"Authorization": f"Basic {ANVIL_API_KEY}"}
else:
    print("Warning: ANVIL_API_KEY is not set. API calls to Anvil will fail.")
    ANVIL_AUTH_HEADER = {}

anvil = Anvil(api_key=ANVIL_API_KEY)

def create_etch_packet(file_content, current_user, file_name = None, file_type = None):
    packet = CreateEtchPacket(
        name="Packet Name"
    )
    
    file_content = base64.b64encode(file_content).decode('utf-8')

    fileID = "testID"
    signatureID = "signatureID"

    if file_name == None:
        file_name = f"{current_user}_{fileID}"
    if file_type == None:
        file_type = "application/pdf"

    signer = EtchSigner(
        name="Test",
        email=current_user.email,
        fields=[SignerField(
            file_id=fileID,
            field_id=signatureID,
        )],
    )

    packet.add_signer(signer)

    file_content = DocumentUpload(
        id=fileID,
        title="Test form",
        file={"filename": file_name, "data": file_content, "mimetype": file_type }, 
        fields=[SignatureField(
            id=signatureID,
            type="signature",
            page_num=0,
            # The position and size of the field
            rect=dict(x=100, y=100, width=100, height=100)
        )]
    )

    packet.add_file(file_content)

    response = anvil.create_etch_packet(payload=packet)

    return response

def submit_filled_pdf(submission_data, db_template):
    payload = {
        "title": "Filled Document from WebForm",
        "fontSize": 14,
        "textColor": "#000000",
        "data": submission_data
    }
    fill_response = anvil.fill_pdf(
        template_id=db_template.anvil_template_eid,
        payload=payload
    )

    return fill_response

def download_filled_pdf(weld_data_eid: str): 
    pdf_bytes = anvil.download_documents(weld_data_eid)
    return pdf_bytes

def get_cast(anvil_template_eid):
    cast_data = anvil.get_cast(eid=anvil_template_eid)
    return cast_data

def get_casts():
    cast_datas = anvil.get_casts()
    return cast_datas