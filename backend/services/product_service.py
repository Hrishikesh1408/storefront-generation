"""
Product Service.

Handles database operations for products. Products are stored globally
by category. Stores reference selected products via a products map
in the store document.
"""
from bson import ObjectId
from db.mongo import db
from utils.image import get_random_image
from services.image_generation_service import generate_product_image_async
import asyncio

products_collection = db["products"]
stores_collection = db["stores"]


async def get_products_by_category(category_value: str) -> list:
    """
    Retrieves all products for a given category.

    Args:
        category_value (str): The category slug (e.g. "clothing").

    Returns:
        list: A list of product documents.
    """
    products = []
    async for p in products_collection.find({"category": category_value}):
        p["_id"] = str(p["_id"])
        products.append(p)
    return products


async def get_store_selected_products(store_id: str) -> list:
    """
    Retrieves the actual product documents that a store has selected.
    In the new personalized model, products are stored directly inside the store document.

    Args:
        store_id (str): The store's ObjectId string.

    Returns:
        list: A list of product documents for the store.
    """
    store = await stores_collection.find_one({"_id": ObjectId(store_id)})
    if not store or not store.get("products"):
        return []

    products = []
    for pid, product_data in store["products"].items():
        if isinstance(product_data, dict):
            # Include the ID inside the product dictionary
            product_data["_id"] = pid
            products.append(product_data)
            
    return products


async def add_manual_product(store_id: str, data: dict) -> dict:
    """
    Adds a custom product directly to the store's products map.

    Args:
        store_id (str): The store's ObjectId string.
        data (dict): Product data (name, description, price, image_url).

    Returns:
        dict: The inserted product document.
    """
    store = await stores_collection.find_one({"_id": ObjectId(store_id)})
    if not store:
        return {"error": "Store not found"}

    import uuid
    pid = str(uuid.uuid4())
    
    product = {
        "_id": pid,
        "category": store.get("category", ""),
        "name": data.get("name"),
        "description": data.get("description"),
        "price": float(data.get("price", 0)),
        "stock": 10,
        "selected": True,
        "image_url": data.get("image_url") or get_random_image(),
    }
    
    # Add to store's products map
    await stores_collection.update_one(
        {"_id": ObjectId(store_id)},
        {
            "$set": {
                f"products.{pid}": product
            }
        }
    )

    if not data.get("image_url") and product.get("name"):
        asyncio.create_task(
            generate_product_image_async(
                product["name"],
                product["category"],
                pid,
                store_id
            )
        )

    return product