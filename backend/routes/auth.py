"""
Authentication Routes.

Provides endpoints for verifying Google login tokens and issuing
JSON Web Tokens (JWT) for use in subsequent authenticated requests.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.google_auth import verify_google_token
from services.jwt_service import create_jwt
from services.user_service import find_or_create_user

router = APIRouter()


class GoogleToken(BaseModel):
    """Payload model for the google login endpoint."""
    token: str


@router.post("/google")
async def google_login(data: GoogleToken):
    """
    Verifies a Google OAuth token, finds or creates the corresponding user 
    in the database, and returns a session JWT alongside user data.
    """
    user_data = verify_google_token(data.token)

    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await find_or_create_user(user_data)

    jwt_token = create_jwt(user)

    return {
        "token": jwt_token,
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "picture": user["picture"],
            "role": user["role"],
        },
    }
