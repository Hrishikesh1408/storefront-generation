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

async def get_store_by_id(store_id: str) -> dict | None:
    """
    Retrieves a store by its ID.
    
    Args:
        store_id (str): Database ID of the store.
        
    Returns:
        dict | None: The store document if found, None otherwise.
    """
    store = await store_collection.find_one({"_id": ObjectId(store_id)})

    if store:
        store["_id"] = str(store["_id"])
        store["owner_id"] = str(store["owner_id"])

    return store


async def get_all_active_stores() -> list:
    """
    Retrieves all stores that have an 'active' status.
    
    Returns:
        list: A list of active store documents.
    """
    cursor = store_collection.find({"status": "active"})
    stores = await cursor.to_list(length=100)
    
    for store in stores:
        store["_id"] = str(store["_id"])
        store["owner_id"] = str(store["owner_id"])
        
    return stores

async def update_product_price_in_store(user_id: str, product_id: str, price: float) -> bool:
    """
    Updates the price of a product in the store.
    
    Args:
        user_id (str): Database ID of the user.
        product_id (str): Database ID of the product.
        price (float): The new price of the product.
        
    Returns:
        bool: True if updated successfully, False otherwise.
    """
    result = await store_collection.update_one(
        {"owner_id": ObjectId(user_id), f"products.{product_id}": {"$exists": True}},
        {"$set": {f"products.{product_id}": {"price": price}}}
    )
    return result.modified_count > 0
