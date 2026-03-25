from db.mongo import db
from models.user_model import create_user_document
from bson import ObjectId

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


async def update_user_role(user_id: str, role: str):


    if role not in ["merchant", "user"]:
        return False

    user = await users_collection.find_one({"_id": ObjectId(user_id)})

    if not user:
        return False
    
    if user.get("role") == "admin":
        return False

    result = await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": role}}
    )

    return result.modified_count > 0