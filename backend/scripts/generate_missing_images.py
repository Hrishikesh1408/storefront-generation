"""
Utility Script: Fill Missing Images.

Queries MongoDB for all products that are missing an `image_url` and
runs the Stable Diffusion generation for each.

Usage:
    python scripts/generate_missing_images.py
"""

import asyncio
import logging
import os
import sys

# Add the project root to sys.path to allow importing from 'services' and 'agents'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.mongo import db
from services.image_generation_service import generate_product_image_async

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("scripts.fill-images")

products_collection = db["products"]


async def main():
    logger.info("Starting missing image generation...")

    # Find products where image_url is empty string, null, or missing
    query = {
        "$or": [
            {"image_url": ""},
            {"image_url": None},
            {"image_url": {"$exists": False}}
        ]
    }
    
    products = await products_collection.find(query).to_list(length=1000)
    
    if not products:
        logger.info("No products found with missing images. Done!")
        return

    logger.info(f"Found {len(products)} products needing images.")

    for i, product in enumerate(products):
        product_name = product.get("name")
        category = product.get("category")
        product_id = product.get("_id")

        if not product_name or not category:
            logger.warning(f"Skipping product with missing name/category: {product_id}")
            continue

        logger.info(f"[{i+1}/{len(products)}] Generating image for: {product_name}...")
        try:
            # generate_product_image_async handles the DB update internally
            await generate_product_image_async(product_name, category, str(product_id))
            logger.info(f"Successfully processed: {product_name}")
        except Exception as e:
            logger.error(f"Failed to generate image for {product_name}: {e}")

    logger.info("Finished missing image generation.")


if __name__ == "__main__":
    asyncio.run(main())
