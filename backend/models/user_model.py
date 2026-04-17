"""
User Model Definitions.

This module contains utilities and helper functions for creating
and formatting user documents before they are inserted into MongoDB.
"""

from datetime import datetime, timezone


def create_user_document(user_data: dict) -> dict:
    """
    Creates a standardized user document for database insertion.

    Args:
        user_data (dict): Dictionary containing raw user data (usually from OAuth provider).

    Returns:
        dict: A formatted dictionary ready for MongoDB insertion.
    """
    return {
        "google_id": user_data.get("google_id"),
        "email": user_data.get("email"),
        "name": user_data.get("name"),
        "picture": user_data.get("picture"),
        "created_at": datetime.now(timezone.utc),
    }
