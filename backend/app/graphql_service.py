import os, base64, requests

# --- Anvil GraphQL Configuration ---
ANVIL_GRAPHQL_URL = "https://graphql.useanvil.com"
ANVIL_API_KEY = os.getenv("ANVIL_API_KEY")
ANVIL_ORG_EID = os.getenv("ANVIL_ORG_EID")

# Anvil's GraphQL API uses Basic Authentication with your API key as the username.
# We must Base64 encode it.
if ANVIL_API_KEY:
    ANVIL_AUTH_HEADER = {"Authorization": f"Basic {ANVIL_API_KEY}"}
else:
    print("Warning: ANVIL_API_KEY is not set. API calls to Anvil will fail.")
    ANVIL_AUTH_HEADER = {}

def get_auth_header(api_key: str) -> dict:
    """Encodes the API key in Base64 and creates the auth header."""
    if not api_key:
        raise ValueError("ANVIL_API_KEY environment variable not set.")
    
    # Anvil requires the API key to be base64 encoded for GraphQL requests.
    # Note the colon at the end of the key before encoding.
    encoded_key = base64.b64encode(f"{api_key}:".encode("utf-8")).decode("utf-8")
    
    return {
        "Authorization": f"Basic {encoded_key}",
        "Content-Type": "application/json",
    }


def create_cast(file_content, filename: str):
    file_content = base64.b64encode(file_content).decode('utf-8')
    query = """
        mutation createCast(
        $organizationEid: String,
        $title: String,
        $file: Upload!,
        $isTemplate: Boolean,
        $allowedAliasIds: [String],
        $detectFields: Boolean,
        $advancedDetectFields: Boolean,
        $detectBoxesAdvanced: Boolean,
        $aliasIds: JSON
        ) {
        createCast(
            organizationEid: $organizationEid,
            title: $title,
            file: $file,
            isTemplate: $isTemplate,
            allowedAliasIds: $allowedAliasIds,
            detectFields: $detectFields,
            advancedDetectFields: $advancedDetectFields,
            detectBoxesAdvanced: $detectBoxesAdvanced,
            aliasIds: $aliasIds
        ) {
            versionNumber
            versionId
            latestDraftVersionNumber
            publishedNumber
            publishedAt
            hasUnpublishedChanges
            hasBeenPublished
            eid
            type
            name
            title
            isTemplate
            exampleData
            allowedAliasIds
            fieldInfo
            config
            createdAt
            updatedAt
            archivedAt
        }
    }
    """

    variables = {
        "organizationEid": "vgKbpusaaGsgkgDk7iWO",
        "title": filename,
        "file": {
            "data": file_content,
            "mimetype": "application/pdf",
            "filename": filename
        },
        "isTemplate": True,
        "allowedAliasIds": ["xyz789"],
        "detectFields": True,
        "advancedDetectFields": True,
        "detectBoxesAdvanced": True,
        "aliasIds": {}
    }

    payload = {
        "query": query,
        "variables": variables
    }
    response = requests.post(
        ANVIL_GRAPHQL_URL,
        headers=get_auth_header(ANVIL_API_KEY),
        json=payload
    )

    response.raise_for_status()  # Raises an exception for bad status codes (4xx or 5xx)
        
    response_data = response.json()
    
    # Check for GraphQL-specific errors returned in the response body
    if 'errors' in response_data:
        print("GraphQL Errors:")
    else:
        print("Successfully received data:")
        # Use json.dumps for pretty-printing the result
    return response_data
