"""
Deduplicator Agent.

Generates stable hash-based IDs for products and performs MongoDB upserts
to prevent duplicate entries across multiple ingestion runs.
"""

import hashlib
import logging
from dataclasses import dataclass
from typing import List

from db.mongo import db

logger = logging.getLogger("agents.deduplicator")

products_collection = db["products"]


@dataclass
class DeduplicationResult:
    """Summary of deduplication outcomes."""
    total_processed: int = 0
    newly_added: int = 0
    duplicates_skipped: int = 0
    errors: int = 0


def generate_hash_id(name: str, category: str) -> str:
    """
    Generates a stable, deterministic hash ID for a product.

    Uses SHA-256 of (lowercase name + category), truncated to 16 chars.
    This ensures the same product from different sources gets the same ID.

    Args:
        name: Cleaned product name.
        category: Normalized category value.

    Returns:
        A 16-char hex string hash ID.
    """
    key = f"{name.lower().strip()}|{category.lower().strip()}"
    return hashlib.sha256(key.encode("utf-8")).hexdigest()[:16]


async def deduplicate_and_store(
    products: List[dict],
) -> DeduplicationResult:
    """
    Stores products in MongoDB with hash-based deduplication.

    Uses upsert with $setOnInsert to only insert new products,
    skipping any that already exist with the same hash ID.

    Args:
        products: List of cleaned product dicts.

    Returns:
        DeduplicationResult with counts of added, skipped, and errored items.
    """
    result = DeduplicationResult(total_processed=len(products))

    for product in products:
        try:
            hash_id = generate_hash_id(
                product["name"], product["category"]
            )

            # Prepare the document with hash ID as _id
            doc = {
                "_id": hash_id,
                "name": product["name"],
                "category": product["category"],
                "price": product["price"],
                "description": product.get("description", ""),
                "image_url": product.get("image_url", ""),
            }

            # Upsert: insert only if not exists
            update_result = await products_collection.update_one(
                {"_id": hash_id},
                {"$setOnInsert": doc},
                upsert=True,
            )

            if update_result.upserted_id is not None:
                result.newly_added += 1
                logger.debug(f"Added new product: {product['name']} ({hash_id})")
            else:
                result.duplicates_skipped += 1
                logger.debug(f"Duplicate skipped: {product['name']} ({hash_id})")

        except Exception as e:
            result.errors += 1
            logger.error(f"Dedup error for '{product.get('name', '?')}': {e}")

    logger.info(
        f"Deduplication complete: {result.newly_added} added, "
        f"{result.duplicates_skipped} skipped, {result.errors} errors"
    )
    return result
