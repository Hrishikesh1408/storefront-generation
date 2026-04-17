"""
Order Model Definitions.
"""
from datetime import datetime, timezone
from bson import ObjectId

def create_order_document(user_id: str, store_id: str, items: list, total_amount: float) -> dict:
    """
    Creates a standardized order document.
    """
    now = datetime.now(timezone.utc)
    
    return {
        "user_id": ObjectId(user_id),
        "store_id": ObjectId(store_id),
        "items": items,
        "total_amount": total_amount,
        "status": "placed",
        "created_at": now,
        "updated_at": now,
    }
