import logging
import uuid
import asyncio
from bson import ObjectId
from db.mongo import db
from agents.langchain_web_agent import run_web_retrieval
from services.image_generation_service import generate_product_image_async
from services.category_service import get_category_values

logger = logging.getLogger("product_generation")
store_collection = db["stores"]

async def generate_store_products(store_id: str, store_details: dict):
    """
    Background task to generate personalized products and images for a store.
    """
    try:
        store_name = store_details.get("name", "")
        store_description = store_details.get("description", "")
        merchant_prompt = store_details.get("prompt", "")
        category = store_details.get("category", "")
        
        # To match legacy category value, just lowercase and hyphenate
        category_value = category.lower().replace(" ", "-")

        logger.info(f"Starting product generation for store {store_id} ({store_name})")

        result = await run_web_retrieval(
            category_label=category,
            category_value=category_value,
            store_name=store_name,
            store_description=store_description,
            merchant_prompt=merchant_prompt
        )

        if not result.products:
            logger.warning(f"No products generated for store {store_id}")
            return

        # Insert products directly into the store document's `products` map
        new_products = {}
        for p in result.products:
            pid = str(uuid.uuid4())
            new_products[pid] = {
                "name": p["name"],
                "price": p["price"],
                "description": p["description"],
                "category": p["category"],
                "image_url": p.get("image_url", ""),
                "stock": 10, # Default stock
                "selected": True # Default visibility
            }

        # Save products to DB
        await store_collection.update_one(
            {"_id": ObjectId(store_id)},
            {"$set": {"products": new_products}}
        )
        logger.info(f"Saved {len(new_products)} products to store {store_id}")

        # Kick off image generation for each product SEQUENTIALLY to prevent Out-Of-Memory crashes
        for pid, product in new_products.items():
            if not product.get("image_url"):
                await generate_product_image_async(
                    product["name"],
                    product["category"],
                    pid,
                    store_id
                )

    except Exception as e:
        logger.error(f"Error in background product generation for store {store_id}: {e}")
