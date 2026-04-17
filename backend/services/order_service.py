"""
Order Service.

Handles checkout and order management.
"""
from bson import ObjectId
from fastapi import HTTPException

from db.mongo import db
from models.order_model import create_order_document
from services.cart_service import clear_cart

order_collection = db["orders"]
store_collection = db["stores"]

async def create_order(user_id: str, store_id: str, items: list) -> dict:
    """
    Creates an order, validates stock, deducts stock, and clears the cart.
    """
    # Important: In a real production system, this should likely be a transaction.
    # For now, we will sequentially validate and upate.

    store = await store_collection.find_one({"_id": ObjectId(store_id)})
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    total_amount = 0.0
    products = store.get("products", {})

    # Validate stock and calculate total
    for item in items:
        prod_id = item["product_id"]
        if prod_id not in products:
            raise HTTPException(status_code=400, detail=f"Product {prod_id} not available in this store")
        
        prod_data = products[prod_id]
        if type(prod_data) is not dict:
            raise HTTPException(status_code=400, detail=f"Product {prod_id} data is invalid")
            
        current_stock = prod_data.get("stock", 0)
        req_qty = item.get("quantity", 1)
        
        if current_stock < req_qty:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for product {prod_id}")
            
        # Optional: verify price matches frontend
        price = prod_data.get("price", item.get("price", 0)) 
        # Update item with confirmed price and capture snapshot name
        item["price"] = price 
        # Name might not be in store products map, but let's assume it was passed correctly 
        
        total_amount += (price * req_qty)

    # Deduct stock
    for item in items:
        prod_id = item["product_id"]
        req_qty = item.get("quantity", 1)
        await store_collection.update_one(
            {"_id": ObjectId(store_id)},
            {"$inc": {f"products.{prod_id}.stock": -req_qty}}
        )

    # Create Order
    new_order = create_order_document(user_id, store_id, items, total_amount)
    result = await order_collection.insert_one(new_order)
    new_order["_id"] = str(result.inserted_id)
    new_order["user_id"] = str(new_order["user_id"])
    new_order["store_id"] = str(new_order["store_id"])

    # Clear cart for user & store
    await clear_cart(user_id, store_id)

    return new_order


async def get_user_orders(user_id: str) -> list:
    """Gets all orders placed by a specific user."""
    cursor = order_collection.find({"user_id": ObjectId(user_id)}).sort("created_at", -1)
    orders = await cursor.to_list(length=100)
    for o in orders:
        o["_id"] = str(o["_id"])
        o["user_id"] = str(o["user_id"])
        o["store_id"] = str(o["store_id"])
    return orders


async def get_store_orders(store_id: str) -> list:
    """Gets all orders placed in a specific store."""
    cursor = order_collection.find({"store_id": ObjectId(store_id)}).sort("created_at", -1)
    orders = await cursor.to_list(length=100)
    for o in orders:
        o["_id"] = str(o["_id"])
        o["user_id"] = str(o["user_id"])
        o["store_id"] = str(o["store_id"])
    return orders
