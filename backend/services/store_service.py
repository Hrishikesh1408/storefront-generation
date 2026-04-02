"""
Store Operations Service.

Handles database operations related to merchants' storefronts.
"""
from bson import ObjectId

from db.mongo import db
from models.store_model import create_store_document

store_collection = db["stores"]


async def find_or_create_store(user_id: str, data: dict) -> dict:
    """
    Retrieves an existing store for a user or creates a new one if it doesn't exist.
    
    Args:
        user_id (str): Database ID of the user.
        data (dict): Store configuration data.
        
    Returns:
        dict: The store document with stringified ObjectIds.
    """
    store = await store_collection.find_one({"owner_id": ObjectId(user_id)})

    if store:
        store["_id"] = str(store["_id"])
        store["owner_id"] = str(store["owner_id"])
        return store

    new_store = create_store_document(user_id, data)

    result = await store_collection.insert_one(new_store)

    new_store["_id"] = str(result.inserted_id)
    new_store["owner_id"] = str(new_store["owner_id"])

    return new_store


async def get_store_by_user(user_id: str) -> dict | None:
    """
    Retrieves a store by its owner's user ID.
    
    Args:
        user_id (str): Database ID of the user.
        
    Returns:
        dict | None: The store document if found, None otherwise.
    """
    store = await store_collection.find_one({"owner_id": ObjectId(user_id)})

    if store:
        store["_id"] = str(store["_id"])
        store["owner_id"] = str(store["owner_id"])

    return store


async def publish_store(user_id: str) -> bool:
    """
    Publishes a store by updating its status to 'active'.
    
    Args:
        user_id (str): Database ID of the user.
        
    Returns:
        bool: True if updated successfully, False otherwise.
    """
    result = await store_collection.update_one(
        {"owner_id": ObjectId(user_id)},
        {"$set": {"status": "active"}}
    )
    
    return result.modified_count > 0


async def select_products_for_store(user_id: str, product_ids: list) -> bool:
    """
    Adds product IDs to the store's products map.

    Args:
        user_id (str): Database ID of the store owner.
        product_ids (list): List of product ID strings to add.

    Returns:
        bool: True if updated successfully.
    """
    update_fields = {f"products.{pid}": True for pid in product_ids}
    result = await store_collection.update_one(
        {"owner_id": ObjectId(user_id)},
        {"$set": update_fields}
    )
    return result.modified_count > 0


async def deselect_product_from_store(user_id: str, product_id: str) -> bool:
    """
    Removes a product ID from the store's products map.

    Args:
        user_id (str): Database ID of the store owner.
        product_id (str): The product ID to remove.

    Returns:
        bool: True if updated successfully.
    """
    result = await store_collection.update_one(
        {"owner_id": ObjectId(user_id)},
        {"$unset": {f"products.{product_id}": ""}}
    )
    return result.modified_count > 0

