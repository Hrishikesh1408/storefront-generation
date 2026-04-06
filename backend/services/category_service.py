"""
Category Service.

Handles database operations for store categories.
When a category is added, 10 products are auto-generated via Ollama
and stored in the products collection.
"""
import json

from bson import ObjectId
from db.mongo import db
from services.ollama_service import call_ollama_async
from utils.image import get_random_image
from services.image_generation_service import generate_product_image_async
import asyncio

categories_collection = db["categories"]
products_collection = db["products"]


def build_product_prompt(category_label: str) -> str:
    """Builds a prompt for Ollama to generate 10 products for a given category."""
    return f"""
Generate exactly 10 products for an online store in the "{category_label}" category.

Return ONLY a valid JSON array with objects containing:
- name (string)
- description (max 15 words)
- price (number between 10 and 200)

No extra text, no markdown, just the JSON array.
"""


def parse_products(raw: str) -> list:
    """Parse the raw Ollama response into a list of products."""
    try:
        return json.loads(raw)
    except Exception as e:
        print("JSON parse error:", e)
        print("RAW RESPONSE:", raw)
        return []


async def _background_category_generation(category_value: str, category_label: str, category_id: str):
    """
    Background task to sequentially generate products via Ollama and then 
    generate their images via Stable Diffusion. Finally sets category status to ready.
    """
    try:
        prompt = build_product_prompt(category_label)
        raw = await call_ollama_async(prompt)
        products = parse_products(raw)

        for p in products:
            try:
                product = {
                    "category": category_value,
                    "name": p.get("name"),
                    "description": p.get("description"),
                    "price": float(p.get("price", 0)),
                    "image_url": get_random_image(),
                }
                result = await products_collection.insert_one(product)
                
                # Sequentially wait for image generation to prevent CPU overload
                await generate_product_image_async(
                    p.get("name"), 
                    category_value, 
                    str(result.inserted_id)
                )

            except Exception as e:
                print("Product insert error:", e)
    
    finally:
        # Mark category as ready
        await categories_collection.update_one(
            {"_id": ObjectId(category_id)}, 
            {"$set": {"status": "ready"}}
        )



async def get_all_categories() -> list:
    """
    Retrieves all categories from the database.

    Returns:
        list: A list of category documents with stringified ObjectIds.
    """
    categories = []
    async for cat in categories_collection.find().sort("label", 1):
        cat["_id"] = str(cat["_id"])
        categories.append(cat)
    return categories


async def add_category(label: str) -> dict:
    """
    Adds a new category and generates 10 products for it.

    Args:
        label (str): The display label for the category (e.g. "Home Decor").

    Returns:
        dict: The inserted category document, or None if it already exists.
    """
    value = label.strip().lower().replace(" ", "_")

    # Check if category value already exists
    existing = await categories_collection.find_one({"value": value})
    if existing:
        return None

    category = {
        "label": label.strip(), 
        "value": value,
        "status": "generating"
    }
    result = await categories_collection.insert_one(category)
    category["_id"] = str(result.inserted_id)

    # Immediately offload generation to background task
    asyncio.create_task(
        _background_category_generation(value, label.strip(), category["_id"])
    )

    return category


async def delete_category(category_id: str) -> bool:
    """
    Deletes a category by its ID.

    Args:
        category_id (str): The MongoDB ObjectId string of the category.

    Returns:
        bool: True if deleted successfully, False otherwise.
    """
    result = await categories_collection.delete_one({"_id": ObjectId(category_id)})
    return result.deleted_count > 0


async def get_category_values() -> list:
    """
    Returns a list of all valid category value strings.

    Returns:
        list: A list of category value strings.
    """
    values = []
    async for cat in categories_collection.find({}, {"value": 1}):
        values.append(cat["value"])
    return values
