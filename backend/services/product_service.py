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

    Args:
        store_id (str): The store's ObjectId string.

    Returns:
        list: A list of product documents the store has selected.
    """
    store = await stores_collection.find_one({"_id": ObjectId(store_id)})
    if not store or not store.get("products"):
        return []

    product_ids = [ObjectId(pid) for pid in store["products"].keys()]
    products = []
    async for p in products_collection.find({"_id": {"$in": product_ids}}):
        p["_id"] = str(p["_id"])
        override = store["products"].get(p["_id"])
        if isinstance(override, dict) and "price" in override:
            p["price"] = override["price"]
        products.append(p)
    return products


async def add_manual_product(store_id: str, data: dict) -> dict:
    """
    Adds a custom product to the products collection and automatically
    maps it to the store.

    Args:
        store_id (str): The store's ObjectId string.
        data (dict): Product data (name, description, price, image_url).

    Returns:
        dict: The inserted product document.
    """
    # Get the store to know the category
    store = await stores_collection.find_one({"_id": ObjectId(store_id)})
    if not store:
        return {"error": "Store not found"}

    product = {
        "category": store.get("category", ""),
        "name": data.get("name"),
        "description": data.get("description"),
        "price": float(data.get("price", 0)),
        "image_url": data.get("image_url") or get_random_image(),
    }
    result = await products_collection.insert_one(product)
    product["_id"] = str(result.inserted_id)

    if not data.get("image_url") and product.get("name"):
        asyncio.create_task(
            generate_product_image_async(
                product["name"],
                product["category"],
                product["_id"]
            )
        )


    # Also add to store's products map and mark as draft
    await stores_collection.update_one(
        {"_id": ObjectId(store_id)},
        {
            "$set": {
                f"products.{product['_id']}": True,
                "status": "draft"
            }
        }
    )

    return product