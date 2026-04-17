"""
Category Service.

Handles database operations for store categories.
When a category is added, the data ingestion agent is triggered
to search the web for real product data, extract it, and store it.
"""
import asyncio
import logging

from bson import ObjectId
from db.mongo import db
from agents.ingestion_agent import run_ingestion

logger = logging.getLogger("services.category")

categories_collection = db["categories"]
products_collection = db["products"]


async def _background_category_ingestion(
    category_value: str, category_label: str, category_id: str
):
    """
    Background task that runs the data ingestion pipeline for a new category.
    Searches the web for real products, extracts, cleans, deduplicates,
    and stores them. Falls back to image generation for missing images.

    On completion, sets category status to 'ready'.
    On failure, sets category status to 'error'.
    """
    try:
        logger.info(f"Starting ingestion for category: {category_label}")
        result = await run_ingestion(category_label, category_value)

        # Store the ingestion summary on the category document
        await categories_collection.update_one(
            {"_id": ObjectId(category_id)},
            {
                "$set": {
                    "status": "ready",
                    "ingestion_summary": {
                        "total_added": result.total_added,
                        "duplicates_skipped": result.duplicates_skipped,
                        "failed_urls": len(result.failed_urls),
                        "total_urls_found": result.total_urls_found,
                        "images_generated": result.images_generated,
                        "elapsed_seconds": result.elapsed_seconds,
                    },
                }
            },
        )

        logger.info(
            f"Ingestion complete for '{category_label}': "
            f"{result.total_added} products added, "
            f"{result.duplicates_skipped} duplicates skipped"
        )

    except Exception as e:
        logger.error(f"Ingestion failed for '{category_label}': {e}")
        await categories_collection.update_one(
            {"_id": ObjectId(category_id)},
            {"$set": {"status": "error", "error_message": str(e)}},
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
    Adds a new category and triggers the data ingestion agent
    to search the web for real product data.

    Args:
        label (str): The display label for the category (e.g. "Bakery").

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
        "status": "generating",
    }
    result = await categories_collection.insert_one(category)
    category["_id"] = str(result.inserted_id)

    # Immediately offload ingestion to background task
    asyncio.create_task(
        _background_category_ingestion(value, label.strip(), category["_id"])
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
