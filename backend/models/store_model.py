"""
Store Model Definitions.

This module contains utilities and helper functions for creating
and formatting store documents representing merchant storefronts.
"""
from datetime import datetime, timezone

from bson import ObjectId


def create_store_document(user_id: str, data: dict) -> dict:
    """
    Creates a standardized store document associated with a specific user.
    
    Args:
        user_id (str): The MongoDB ObjectId string of the user creating the store.
        data (dict): The store details such as name, description, etc.
        
    Returns:
        dict: A formatted dictionary ready for MongoDB insertion.
    """
    now = datetime.now(timezone.utc)

    return {
        "name": data["name"],
        "category": data.get("category"),
        "description": data.get("description"),
        "logo": data.get("logo"),
        "owner_id": ObjectId(user_id),
        "status": "draft",
        "created_at": now,
        "updated_at": now,
    }
