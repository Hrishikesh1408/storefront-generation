from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db.mongo import db
from services.user_service import update_user_role
from typing import Optional
from fastapi import Query

router = APIRouter()


# ================= GET USER =================
@router.get("/admin/users/{email}")
async def get_user(email: str):

    user = await db["users"].find_one({"email": email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user.get("name"),
        "role": user.get("role")
    }

# ================= LIST USERS (LATEST + SEARCH) =================
@router.get("/admin/users")
async def list_users(email: Optional[str] = Query(None)):

    query = {}

    # 🔍 If searching by email
    if email:
        query["email"] = {"$regex": email, "$options": "i"}

    users_cursor = (
        db["users"]
        .find(query)
        .sort("created_at", -1)
        .limit(10)
    )

    users = []

    async for user in users_cursor:

        if "email" not in user:
            continue

        users.append({
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user.get("name"),
            "role": user.get("role"),
            "created_at": user.get("created_at")
        })

    return {"users": users}


# ================= REQUEST MODEL =================
class UpdateRoleRequest(BaseModel):
    user_id: str
    role: str


# ================= UPDATE ROLE =================
@router.post("/admin/update-role")
async def update_role(req: UpdateRoleRequest):

    updated = await update_user_role(req.user_id, req.role)

    if not updated:
        raise HTTPException(
            status_code=400,
            detail="User not found or invalid role or cannot change admin role"
        )

    return {
        "message": "Role updated successfully",
        "user_id": req.user_id,
        "new_role": req.role
    }