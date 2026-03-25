"""
Google Authentication Service.

Handles verification of Google OAuth2 tokens.
"""
import os

from google.auth.transport import requests
from google.oauth2 import id_token

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


def verify_google_token(token: str) -> dict | None:
    """
    Verifies a Google OAuth2 token and extracts user data.
    
    Args:
        token (str): The JWT token provided by Google sign-in.
        
    Returns:
        dict | None: User data dictionary if successful, None otherwise.
    """
    try:
        idinfo = id_token.verify_oauth2_token(
            token, requests.Request(), GOOGLE_CLIENT_ID
        )

        user_data = {
            "google_id": idinfo["sub"],
            "email": idinfo["email"],
            "name": idinfo.get("name"),
            "picture": idinfo.get("picture"),
        }

        return user_data

    except ValueError:
        return None
