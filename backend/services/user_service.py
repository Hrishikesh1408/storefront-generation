"""
User Operations Service.

Handles database operations related to user accounts and roles.
"""
from bson import ObjectId

from db.mongo import db
from models.user_model import create_user_document

users_collection = db["users"]


async def find_or_create_user(user_data: dict) -> dict:
    """
    Retrieves an existing user by Google ID or creates a new user profile.
    
    Args:
        user_data (dict): Data extracted from Google OAuth.
        
    Returns:
        dict: The user document.
    """
    user = await users_collection.find_one({"google_id": user_data["google_id"]})

    if user:
        return user

    new_user = create_user_document(user_data)
    new_user["role"] = "user"

    result = await users_collection.insert_one(new_user)

    new_user["_id"] = result.inserted_id

    return new_user


async def update_user_role(user_id: str, role: str) -> bool:
    """
    Updates a user's role (e.g., from 'user' to 'merchant').
    
    Args:
        user_id (str): Database ID of the user.
        role (str): The new role to assign.
        
    Returns:
        bool: True if the update was successful, False if invalid role, user not found, or user is an admin.
    """
    if role not in ["merchant", "user"]:
        return False

    user = await users_collection.find_one({"_id": ObjectId(user_id)})

    if not user:
        return False

    if user.get("role") == "admin":
        return False

    result = await users_collection.update_one(
        {"_id": ObjectId(user_id)}, {"$set": {"role": role}}
    )

    return result.modified_count > 0
