"""
Product Routes.

Endpoints for product operations.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from services.product_service import (
    get_products_by_category,
    get_store_selected_products,
    add_manual_product,
)
from services.jwt_service import verify_jwt

router = APIRouter()


class ManualProductRequest(BaseModel):
    store_id: str
    name: str
    description: str
    price: float
    image_url: str = ""


@router.get("/products/by-category/{category}")
async def get_category_products_api(category: str):
    """Returns all products for a given category."""
    products = await get_products_by_category(category)
    return products


@router.get("/products/store/{store_id}")
async def get_store_products_api(store_id: str):
    """Returns products that a store has selected."""
    products = await get_store_selected_products(store_id)
    return products


@router.post("/products/manual")
async def add_manual_product_api(req: ManualProductRequest):
    """Adds a custom product and maps it to the store."""
    return await add_manual_product(req.store_id, req.dict())