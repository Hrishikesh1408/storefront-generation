"""
Store Routes.

Endpoints for merchants to create and view their storefront details.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from services.jwt_service import verify_jwt
from services.store_service import (
    find_or_create_store,
    get_store_by_user,
    publish_store,
    select_products_for_store,
    deselect_product_from_store,
    get_store_by_id,
    get_all_active_stores,
    update_product_price_in_store,
)
from services.category_service import get_category_values

router = APIRouter()


class StoreCreate(BaseModel):
    """Payload model for creating a store."""
    name: str
    category: str = None
    description: str = None
    logo: Optional[str] = None


class SelectProducts(BaseModel):
    """Payload for selecting multiple products."""
    product_ids: list[str]


@router.post("/store/create")
async def create_store(data: StoreCreate, user=Depends(verify_jwt)):
    """
    Creates a new store for the authenticated merchant. 
    Validates category against the categories collection and requires merchant role.
    """
    allowed_categories = await get_category_values()

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


@router.post("/store/publish")
async def publish_my_store(user=Depends(verify_jwt)):
    """
    Publishes the merchant's store, setting its status to 'active'.
    """
    success = await publish_store(user["user_id"])
    if not success:
        raise HTTPException(status_code=400, detail="Failed to publish store or store not found")
    
    return {"message": "Store published successfully"}


@router.post("/store/select-products")
async def select_store_products(data: SelectProducts, user=Depends(verify_jwt)):
    """
    Adds selected product IDs to the merchant's store.
    """
    success = await select_products_for_store(user["user_id"], data.product_ids)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update selected products")
    
    return {"message": "Products selected successfully"}


@router.post("/store/deselect-product/{product_id}")
async def deselect_store_product(product_id: str, user=Depends(verify_jwt)):
    """
    Removes a single product ID from the merchant's store.
    """
    success = await deselect_product_from_store(user["user_id"], product_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to deselect product")
    
    return {"message": "Product deselected successfully"}

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
