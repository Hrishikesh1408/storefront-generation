"""
Cart Service.

Handles persistence of user shopping carts across sessions.
"""
from bson import ObjectId
from datetime import datetime, timezone

from db.mongo import db
from models.cart_model import create_cart_document

cart_collection = db["carts"]

async def get_cart(user_id: str, store_id: str) -> dict | None:
    """Retrieves a user's cart for a specific store."""
    cart = await cart_collection.find_one({
        "user_id": ObjectId(user_id),
        "store_id": ObjectId(store_id)
    })
    
    if cart:
        cart["_id"] = str(cart["_id"])
        cart["user_id"] = str(cart["user_id"])
        cart["store_id"] = str(cart["store_id"])
        return cart
        
    return None

async def update_cart(user_id: str, store_id: str, items: list) -> dict:
    """Updates or creates a user's cart for a specific store."""
    now = datetime.now(timezone.utc)
    
    # Try to find existing cart
    cart = await cart_collection.find_one({
        "user_id": ObjectId(user_id),
        "store_id": ObjectId(store_id)
    })
    
    if cart:
        await cart_collection.update_one(
            {"_id": cart["_id"]},
            {"$set": {"items": items, "updated_at": now}}
        )
        cart["items"] = items
        cart["updated_at"] = now
        cart["_id"] = str(cart["_id"])
        cart["user_id"] = str(cart["user_id"])
        cart["store_id"] = str(cart["store_id"])
        return cart
    
    # Create new cart
    new_cart = create_cart_document(user_id, store_id, items)
    result = await cart_collection.insert_one(new_cart)
    new_cart["_id"] = str(result.inserted_id)
    new_cart["user_id"] = str(new_cart["user_id"])
    new_cart["store_id"] = str(new_cart["store_id"])
    return new_cart

async def clear_cart(user_id: str, store_id: str) -> bool:
    """Clears a user's cart after successful checkout."""
    result = await cart_collection.delete_one({
        "user_id": ObjectId(user_id),
        "store_id": ObjectId(store_id)
    })
    return result.deleted_count > 0
