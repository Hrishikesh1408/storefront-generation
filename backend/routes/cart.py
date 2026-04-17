"""
Cart Routes.

Endpoints for managing the user's shopping cart.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List

from services.jwt_service import verify_jwt
from services.cart_service import get_cart, update_cart

router = APIRouter()

class CartItemModel(BaseModel):
    product_id: str
    quantity: int
    name: str = None # Optional tracking
    price: float = None # Optional tracking

class CartUpdateModel(BaseModel):
    items: List[CartItemModel]

@router.get("/cart/{store_id}")
async def fetch_cart(store_id: str, user=Depends(verify_jwt)):
    """Retrieves the cart for the authenticated user for a specific store."""
    cart = await get_cart(user["user_id"], store_id)
    return cart

@router.post("/cart/{store_id}")
async def save_cart(store_id: str, data: CartUpdateModel, user=Depends(verify_jwt)):
    """Updates the cart for the authenticated user for a specific store."""
    items_list = [item.model_dump() for item in data.items]
    cart = await update_cart(user["user_id"], store_id, items_list)
    return cart
