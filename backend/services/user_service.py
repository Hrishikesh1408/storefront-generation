from db.mongo import db
from models.user_model import create_user_document

users_collection = db["users"]


def find_or_create_user(user_data):

    user = users_collection.find_one({
        "google_id": user_data["google_id"]
    })

    if user:
        return user

    new_user = create_user_document(user_data)

    result = users_collection.insert_one(new_user)

    new_user["_id"] = result.inserted_id

    return new_user