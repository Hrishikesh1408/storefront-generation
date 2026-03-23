from bson import ObjectId
from db.mongo import db
from models.store_model import create_store_document

store_collection = db["stores"]


async def find_or_create_store(user_id: str, data: dict):
    store = await store_collection.find_one({
        "owner_id": ObjectId(user_id)
    })

    if store:
        store["_id"] = str(store["_id"])
        store["owner_id"] = str(store["owner_id"])   # ✅ ADD THIS
        return store

    new_store = create_store_document(user_id, data)

    result = await store_collection.insert_one(new_store)

    new_store["_id"] = str(result.inserted_id)
    new_store["owner_id"] = str(new_store["owner_id"])  # ✅ ADD THIS

    return new_store

async def get_store_by_user(user_id: str):
    store = await store_collection.find_one({
        "owner_id": ObjectId(user_id)
    })

    if store:
        store["_id"] = str(store["_id"])
        store["owner_id"] = str(store["owner_id"])   # ✅ ADD THIS

    return store