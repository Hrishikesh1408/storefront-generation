from fastapi import APIRouter, HTTPException
from db.mongo import db

users_collection = db["users"]

router = APIRouter()

@router.get("/admin/users/{email}")
async def get_user(email: str):

    user = await users_collection.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user.get("name"),
        "role": user.get("role")
    }