"""
Ingestion Agent — Pipeline Orchestrator (LangChain Architecture).

Wires the LangChain web retrieval agent into the full ingestion pipeline:
  LangChain Web Agent → Clean → Deduplicate → Store → Image Fallback

The LangChain agent handles Search + Scrape + RAG Extraction as a
deterministic LCEL chain, replacing the previous manual pipeline.

If scraped image_url is missing, falls back to Stable Diffusion generation.
"""

import asyncio
import logging
import time
from dataclasses import dataclass, field
from typing import List

from agents.langchain_web_agent import run_web_retrieval
from agents.cleaner import clean_products
from agents.deduplicator import deduplicate_and_store, generate_hash_id
from services.image_generation_service import generate_product_image_async

logger = logging.getLogger("agents.ingestion")

# Configure logging for the agents package
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)


@dataclass
class IngestionResult:
    """Summary of a complete ingestion run."""
    category: str
    total_added: int = 0
    duplicates_skipped: int = 0
    failed_urls: List[str] = field(default_factory=list)
    total_urls_found: int = 0
    total_urls_scraped: int = 0
    total_products_extracted: int = 0
    total_products_cleaned: int = 0
    images_generated: int = 0
    elapsed_seconds: float = 0.0
    errors: List[str] = field(default_factory=list)


async def _generate_missing_images(
    products: List[dict], category_value: str
) -> int:
    """
    For products missing image_url, fall back to Stable Diffusion generation.
    Checks DB first to see if an image was already generated in a previous run.

    Args:
        products: List of product dicts (extracted this run).
        category_value: The normalized category value.

    Returns:
        Number of images generated.
    """
    from db.mongo import db
    products_collection = db["products"]
    count = 0

    for product in products:
        # Step 1: LLM always returns image_url="" which triggers this
        if not product.get("image_url"):
            product_id = generate_hash_id(product["name"], product["category"])
            
            # Step 2: Check if DB already has a valid URL for this product
            existing = await products_collection.find_one({"_id": product_id})
            if existing and existing.get("image_url") and existing["image_url"].startswith("http"):
                logger.info(f"Image already exists in DB for: {product['name']} (skipping)")
                continue

            # Step 3: Generate if missing
            try:
                await generate_product_image_async(
                    product["name"], category_value, product_id
                )
                count += 1
                logger.info(f"Generated fallback image for: {product['name']}")
            except Exception as e:
                logger.warning(f"Image generation failed for {product['name']}: {e}")
    return count


async def run_ingestion(
    category_label: str, category_value: str
) -> IngestionResult:
    """
    Runs the full LangChain-powered data ingestion pipeline for a product category.

    Pipeline:
        1. LangChain Web Agent — search, scrape, and RAG-extract products
        2. Clean — normalize names, prices; filter irrelevant items
        3. Deduplicate — hash-based upsert into MongoDB
        4. Image fallback — generate images for products missing image_url

    Args:
        category_label: Human-readable category (e.g. "Bakery").
        category_value: Normalized slug (e.g. "bakery").

    Returns:
        IngestionResult with full run statistics.
    """
    result = IngestionResult(category=category_label)
    start_time = time.time()

    logger.info(f"{'='*60}")
    logger.info(f"Starting LangChain ingestion for category: {category_label}")
    logger.info(f"{'='*60}")

    # ──────────────────────────────────────────────
    # STEP 1: LangChain Web Retrieval Agent
    # ──────────────────────────────────────────────
    logger.info("STEP 1/4: Running LangChain web retrieval agent...")
    try:
        agent_result = await run_web_retrieval(category_label, category_value)
        result.total_urls_found = agent_result.urls_found
        result.total_urls_scraped = agent_result.urls_loaded
        result.total_products_extracted = len(agent_result.products)

        logger.info(
            f"LangChain agent: {agent_result.urls_found} URLs found, "
            f"{agent_result.urls_loaded} scraped, "
            f"{len(agent_result.products)} products extracted "
            f"(confidence: {agent_result.confidence:.2f})"
        )

        if agent_result.error:
            result.errors.append(f"Agent error: {agent_result.error}")

    except Exception as e:
        logger.error(f"LangChain web agent failed: {e}")
        result.errors.append(f"Web agent failed: {e}")
        result.elapsed_seconds = time.time() - start_time
        return result

    if not agent_result.products:
        result.errors.append("No products extracted by LangChain agent")
        result.elapsed_seconds = time.time() - start_time
        return result

    # ──────────────────────────────────────────────
    # STEP 2: Clean & Normalize
    # ──────────────────────────────────────────────
    logger.info("STEP 2/4: Cleaning and normalizing products...")
    cleaned_products = clean_products(agent_result.products, category_value)
    result.total_products_cleaned = len(cleaned_products)
    logger.info(f"Products after cleaning: {len(cleaned_products)}")

    if not cleaned_products:
        logger.warning("All products filtered out during cleaning")
        result.errors.append("All products invalidated during cleaning")
        result.elapsed_seconds = time.time() - start_time
        return result

    # ──────────────────────────────────────────────
    # STEP 3: Deduplicate & Store
    # ──────────────────────────────────────────────
    logger.info("STEP 3/4: Deduplicating and storing in MongoDB...")
    dedup_result = await deduplicate_and_store(cleaned_products)
    result.total_added = dedup_result.newly_added
    result.duplicates_skipped = dedup_result.duplicates_skipped

    logger.info(
        f"Stored: {dedup_result.newly_added} new, "
        f"{dedup_result.duplicates_skipped} duplicates skipped"
    )

    # ──────────────────────────────────────────────
    # STEP 4: Image Fallback
    # ──────────────────────────────────────────────
    logger.info("STEP 4/4: Generating images for products missing image_url...")
    products_needing_images = [
        p for p in cleaned_products if not p.get("image_url")
    ]

    if products_needing_images:
        logger.info(f"{len(products_needing_images)} products need image generation")
        images_generated = await _generate_missing_images(
            products_needing_images, category_value
        )
        result.images_generated = images_generated
    else:
        logger.info("All products have image URLs — no generation needed")

    # ──────────────────────────────────────────────
    # Done
    # ──────────────────────────────────────────────
    result.elapsed_seconds = round(time.time() - start_time, 2)

    logger.info(f"{'='*60}")
    logger.info(f"LangChain ingestion complete for '{category_label}'")
    logger.info(f"  Added: {result.total_added}")
    logger.info(f"  Duplicates skipped: {result.duplicates_skipped}")
    logger.info(f"  Images generated: {result.images_generated}")
    logger.info(f"  Time: {result.elapsed_seconds}s")
    logger.info(f"{'='*60}")

    return result
