"""
Order Routes.

Endpoints for checkout and order history.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List

from services.jwt_service import verify_jwt
from services.order_service import create_order, get_user_orders, get_store_orders
from services.store_service import get_store_by_user

router = APIRouter()

class OrderItemModel(BaseModel):
    product_id: str
    quantity: int
    name: str = None
    price: float = None

class CheckoutModel(BaseModel):
    store_id: str
    items: List[OrderItemModel]

@router.post("/order/checkout")
async def checkout(data: CheckoutModel, user=Depends(verify_jwt)):
    """Places a new order."""
    items_list = [item.model_dump() for item in data.items]
    try:
        order = await create_order(user["user_id"], data.store_id, items_list)
        return order
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/order/my-orders")
async def my_orders(user=Depends(verify_jwt)):
    """Retrieves order history for the authenticated user."""
    orders = await get_user_orders(user["user_id"])
    return orders

@router.get("/order/store-orders")
async def store_orders(user=Depends(verify_jwt)):
    """Retrieves order history for the authenticated merchant's store."""
    if user["role"] != "merchant":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    store = await get_store_by_user(user["user_id"])
    if not store:
        return []
        
    orders = await get_store_orders(store["_id"])
    return orders
