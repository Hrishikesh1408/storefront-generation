"""
Admin Routes.

Handles API endpoints for administrative tasks such as listing users,
searching for users by email, and updating user roles.
"""
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from db.mongo import db
from services.user_service import update_user_role

router = APIRouter()


@router.get("/admin/users/{email}")
async def get_user(email: str):
    """
    Retrieves a single user's detailed information by email.
    """
    user = await db["users"].find_one({"email": email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user.get("name"),
        "role": user.get("role"),
    }


@router.get("/admin/users")
async def list_users(email: Optional[str] = Query(None)):
    """
    Lists users. If an email query parameter is provided, it searches
    for users matching the email string using a regex match. Returns 
    up to 10 latest users sorted by creation date.
    """
    query = {}

    # 🔍 If searching by email
    if email:
        query["email"] = {"$regex": email, "$options": "i"}

    users_cursor = db["users"].find(query).sort("created_at", -1).limit(10)

    users = []

    async for user in users_cursor:

        if "email" not in user:
            continue

        users.append(
            {
                "id": str(user["_id"]),
                "email": user["email"],
                "name": user.get("name"),
                "role": user.get("role"),
                "created_at": user.get("created_at"),
            }
        )

    return {"users": users}


class UpdateRoleRequest(BaseModel):
    user_id: str
    role: str


@router.post("/admin/update-role")
async def update_role(req: UpdateRoleRequest):
    """
    Updates the role of a user given their user_id. 
    Protects against changing an admin's role.
    """
    updated = await update_user_role(req.user_id, req.role)

    if not updated:
        raise HTTPException(
            status_code=400,
            detail="User not found or invalid role or cannot change admin role",
        )

    return {
        "message": "Role updated successfully",
        "user_id": req.user_id,
        "new_role": req.role,
    }
