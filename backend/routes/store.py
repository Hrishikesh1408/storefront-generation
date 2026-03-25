"""
Store Routes.

Endpoints for merchants to create and view their storefront details.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from services.jwt_service import verify_jwt
from services.store_service import find_or_create_store, get_store_by_user

router = APIRouter()


class StoreCreate(BaseModel):
    """Payload model for creating a store."""
    name: str
    category: str = None
    description: str = None
    logo: Optional[str] = None


@router.post("/store/create")
async def create_store(data: StoreCreate, user=Depends(verify_jwt)):
    """
    Creates a new store for the authenticated merchant. 
    Validates category constraints and requires merchant role.
    """
    allowed_categories = [
        "clothing",
        "home_decor",
        "beauty",
        "food_beverage",
        "bakery",
    ]

    if data.category not in allowed_categories:
        raise HTTPException(status_code=400, detail="Invalid category")

    if user["role"] != "merchant":
        raise HTTPException(status_code=403, detail="Not authorized")

    store = await find_or_create_store(user["user_id"], data.model_dump())

    return store


@router.get("/store/me")
async def get_my_store(user=Depends(verify_jwt)):
    """
    Retrieves the storefront configuration for the currently authenticated user.
    """
    store = await get_store_by_user(user["user_id"])
    return store
