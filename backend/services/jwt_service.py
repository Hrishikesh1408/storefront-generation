"""
JWT Authentication Service.

Handles creation and verification of JSON Web Tokens used for user sessions.
"""
import os
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, Request
from jose import jwt
from jose.exceptions import JWTError

SECRET = os.getenv("JWT_SECRET")


def create_jwt(user: dict) -> str:
    """
    Creates a JWT token for a given user.
    
    Args:
        user (dict): User dictionary containing at least _id, email, and role.
        
    Returns:
        str: Encoded JWT token string.
    """
    payload = {
        "user_id": str(user["_id"]),
        "email": user["email"],
        "name": user.get("name", ""),
        "picture": user.get("picture", ""),
        "role": user["role"],
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }

    token = jwt.encode(payload, SECRET, algorithm="HS256")

    return token


def verify_jwt(request: Request) -> dict:
    """
    Verifies the JWT token from the request Authorization header.
    
    Args:
        request (Request): FastAPI request object.
        
    Returns:
        dict: The decoded token payload.
        
    Raises:
        HTTPException: If token is missing, invalid, or expired.
    """
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing token")

    parts = auth_header.split(" ")

    if len(parts) != 2 or parts[0] != "Bearer":
        raise HTTPException(status_code=401, detail="Invalid token format")

    token = parts[1]

    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        return payload

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
