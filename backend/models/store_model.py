from datetime import datetime, timezone
from bson import ObjectId


def create_store_document(user_id: str, data: dict):
    now = datetime.now(timezone.utc)

    return {
        "name": data["name"],
        "category": data.get("category"),
        "description": data.get("description"),
        "logo": data.get("logo"),
        "owner_id": ObjectId(user_id),
        "status": "draft",
        "created_at": now,
        "updated_at": now
    }