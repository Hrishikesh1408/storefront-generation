"""
Cart Model Definitions.
"""
from datetime import datetime, timezone
from bson import ObjectId

def create_cart_document(user_id: str, store_id: str, items: list) -> dict:
    """
    Creates a standardized cart document.
    """
    now = datetime.now(timezone.utc)
    
    return {
        "user_id": ObjectId(user_id),
        "store_id": ObjectId(store_id),
        "items": items,
        "updated_at": now,
    }
