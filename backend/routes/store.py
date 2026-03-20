from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from services.store_service import find_or_create_store, get_store_by_user
from services.jwt_service import verify_jwt

router = APIRouter()


class StoreCreate(BaseModel):
    name: str
    category: str = None
    description: str = None
    logo: Optional[str] = None  # can be URL later


@router.post("/store/create")
async def create_store(data: StoreCreate, user=Depends(verify_jwt)):
    if user["role"] != "merchant":
        raise HTTPException(status_code=403, detail="Not authorized")

    store = await find_or_create_store(
        user["user_id"],
        data.model_dump()   # ✅ correct
    )

    return store


@router.get("/store/me")
async def get_my_store(user=Depends(verify_jwt)):
    store = await get_store_by_user(user["user_id"])
    return store