"""
Store Routes.

Endpoints for merchants to create and view their storefront details.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from services.jwt_service import verify_jwt
from services.store_service import (
    get_store_by_user,
    publish_store,
    get_store_by_id,
    get_all_active_stores,
    update_product_price_in_store,
)
from services.category_service import get_category_values

router = APIRouter()


class StoreCreate(BaseModel):
    """Payload model for creating a store."""
    prompt: str
    logo: Optional[str] = None

class StoreUpdate(BaseModel):
    """Payload model for updating a store."""
    name: str
    category: str
    description: str


class SelectProducts(BaseModel):
    """Payload for selecting multiple products."""
    product_ids: list[str]


@router.post("/store/create")
async def create_store(data: StoreCreate, user=Depends(verify_jwt)):
    """
    Creates a new store for the authenticated merchant from a prompt.
    """
    if user["role"] != "merchant":
        raise HTTPException(status_code=403, detail="Not authorized")

    from services.store_service import deduce_store_details, create_store_from_prompt
    
    # Fast LLM call to deduce name, description, category
    store_details = await deduce_store_details(data.prompt)
    if not store_details:
        raise HTTPException(status_code=500, detail="Failed to deduce store details from prompt")
    
    store_details["prompt"] = data.prompt
    store_details["logo"] = data.logo

    store = await create_store_from_prompt(user["user_id"], store_details)

    return store

@router.post("/store/update")
async def update_store(data: StoreUpdate, user=Depends(verify_jwt)):
    """
    Updates the store details for the authenticated merchant.
    """
    from services.store_service import update_store_details
    store = await update_store_details(user["user_id"], data.model_dump())
    if not store:
        raise HTTPException(status_code=404, detail="Store not found or update failed")
    return store


@router.get("/store/me")
async def get_my_store(user=Depends(verify_jwt)):
    """
    Retrieves the storefront configuration for the currently authenticated user.
    """
    store = await get_store_by_user(user["user_id"])
    return store


@router.post("/store/publish")
async def publish_my_store(user=Depends(verify_jwt)):
    """
    Publishes the merchant's store, setting its status to 'active'.
    """
    success = await publish_store(user["user_id"])
    if not success:
        raise HTTPException(status_code=400, detail="Failed to publish store or store not found")
    
    return {"message": "Store published successfully"}




@router.get("/store/active/all")
async def get_active_stores():
    """
    Retrieves a list of all active stores.
    """
    stores = await get_all_active_stores()
    return stores

@router.get("/store/{store_id}")
async def get_store(store_id: str):
    """
    Retrieves the storefront configuration for a specific store.
    """
    store = await get_store_by_id(store_id)
    return store

@router.post("/store/product/price")
async def update_product_price(data: dict, user=Depends(verify_jwt)):
    """
    Updates the price of a product in the store.
    """
    success = await update_product_price_in_store(user["user_id"], data["product_id"], data["price"])
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update product price")
    
    return {"message": "Product price updated successfully"}

@router.post("/store/product/stock")
async def update_product_stock(data: dict, user=Depends(verify_jwt)):
    """
    Updates the stock count of a product in the store.
    """
    from services.store_service import update_product_stock_in_store
    success = await update_product_stock_in_store(user["user_id"], data["product_id"], data["stock"])
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update product stock")
    
    return {"message": "Product stock updated successfully"}

@router.post("/store/product/visibility")
async def update_product_visibility(data: dict, user=Depends(verify_jwt)):
    """
    Updates the visibility (selected status) of a product in the store.
    """
    from services.store_service import update_product_visibility_in_store
    success = await update_product_visibility_in_store(user["user_id"], data["product_id"], data["selected"])
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update product visibility")
    
    return {"message": "Product visibility updated successfully"}
