from fastapi import APIRouter
from pydantic import BaseModel
from services.product_service import (
    generate_products_for_store,
    get_products_by_store,
    toggle_product_selection,
    add_manual_product
)

router = APIRouter()

class ManualProductRequest(BaseModel):
    store_id: str
    name: str
    description: str
    price: float
    image_url: str = ""

@router.post("/generate-products")
async def generate_products_api(store_id: str):
    return await generate_products_for_store(store_id)

@router.get("/store/{store_id}")
async def get_store_products_api(store_id: str):
    return await get_products_by_store(store_id)

@router.patch("/{product_id}/toggle-selection")
async def toggle_product_selection_api(product_id: str):
    return await toggle_product_selection(product_id)

@router.post("/manual")
async def add_manual_product_api(req: ManualProductRequest):
    return await add_manual_product(req.store_id, req.dict())