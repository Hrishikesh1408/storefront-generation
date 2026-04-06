"""
Authentication Routes.

Provides endpoints for verifying Google login tokens and issuing
JSON Web Tokens (JWT) for use in subsequent authenticated requests.
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional

from services.google_auth import verify_google_token
from services.jwt_service import create_jwt, verify_jwt
from services.user_service import find_or_create_user, update_user_profile

router = APIRouter()


class GoogleToken(BaseModel):
    """Payload model for the google login endpoint."""
    token: str


class ProfileUpdate(BaseModel):
    """Payload model for profile update endpoint."""
    name: Optional[str] = None
    picture: Optional[str] = None


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


@router.put("/profile")
async def update_profile(data: ProfileUpdate, request: Request):
    """
    Updates the authenticated user's profile (name and/or picture).
    Returns the updated user data and a fresh JWT token.
    """
    payload = verify_jwt(request)
    user_id = payload["user_id"]

    updated_user = await update_user_profile(
        user_id, name=data.name, picture=data.picture
    )

    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")

    new_token = create_jwt(updated_user)

    return {
        "token": new_token,
        "user": {
            "id": str(updated_user["_id"]),
            "email": updated_user["email"],
            "name": updated_user.get("name", ""),
            "picture": updated_user.get("picture", ""),
            "role": updated_user["role"],
        },
    }

