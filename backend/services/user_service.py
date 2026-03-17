from db.mongo import db
from models.user_model import create_user_document

users_collection = db["users"]


async def find_or_create_user(user_data):

    user = await users_collection.find_one({
        "google_id": user_data["google_id"]
    })

    if user:
        return user

    new_user = create_user_document(user_data)
    new_user["role"] = "user"

    result = await users_collection.insert_one(new_user)

    new_user["_id"] = result.inserted_id

    return new_user