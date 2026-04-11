"""
Cleaner & Normalizer Agent.

Standardizes product data from the RAG extraction:
  - Title-case names, strip quantities/sizes/brands
  - Integer prices (strip currency symbols)
  - Clean descriptions (no weight/size mentions)
  - Validate image URLs
  - Filter non-category items
"""

import re
import logging
from typing import List, Optional
from urllib.parse import urlparse

logger = logging.getLogger("agents.cleaner")

# Patterns to strip from product names (sizes, weights, quantities, pack info)
NAME_STRIP_PATTERNS = [
    r"\s*-?\s*\d+\s*(?:kg|g|gm|gms|ml|ltr?|litre?s?|oz|lb)\b",  # weights
    r"\s*-?\s*\d+\s*(?:pcs?|pieces?|pack|pk|set)\b",  # quantities
    r"\s*\(\s*\d+\s*(?:kg|g|gm|gms|ml|ltr?|inch|cm|mm|pcs?|pieces?|pack|cavity)[\s\w]*\)",  # parenthetical
    r"\s*-\s*\d+\s*(?:kg|g|gm|gms|ml|ltr?)?\s*$",  # trailing dash + number
    r"\s*\d+\s*(?:inch|\")\s*",  # inch measurements
    r"\s*\d+\s*x\s*\d+\s*(?:cm|mm|inch|\")\s*",  # dimensions
    r"\s*\bdia\s*\d+",  # diameter
    r"\s*\bht\s*\d+",  # height
]

# Words that indicate a tool/supply, not a consumable product
NON_PRODUCT_KEYWORDS = [
    "mould", "mold", "cutter", "nozzle", "pan", "tray", "container",
    "foil", "mat", "knife", "roller", "piping", "tip", "spatula",
    "board", "wrapper", "box", "bag", "candle", "topper", "decoration",
    "stencil", "scraper", "brush", "thermometer", "scale", "mixer",
    "stand", "rack", "display", "packaging", "label", "sticker",
]


def _clean_name(name: str) -> str:
    """
    Cleans a product name: strips quantities, sizes, brands, normalizes casing.

    Args:
        name: Raw product name from LLM.

    Returns:
        Cleaned, title-cased product name.
    """
    if not name:
        return ""

    cleaned = name.strip()

    # Strip quantity/size patterns (case-insensitive)
    for pattern in NAME_STRIP_PATTERNS:
        cleaned = re.sub(pattern, "", cleaned, flags=re.IGNORECASE)

    # Remove leading/trailing dashes and whitespace
    cleaned = cleaned.strip(" -–—")

    # Remove extra whitespace
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    # Title case
    cleaned = cleaned.title()

    return cleaned


def _clean_price(price) -> int:
    """
    Converts a price value to an integer, stripping currency symbols.

    Args:
        price: Raw price value (str, int, or float).

    Returns:
        Integer price, or 0 if unparseable.
    """
    if price is None:
        return 0

    if isinstance(price, (int, float)):
        return max(0, int(round(price)))

    price_str = str(price).strip()
    price_str = re.sub(r"[₹$€£¥,\s]", "", price_str)

    # Handle ranges like "200-300" → take the lower value
    if "-" in price_str:
        parts = price_str.split("-")
        price_str = parts[0].strip()

    try:
        return max(0, int(round(float(price_str))))
    except (ValueError, TypeError):
        logger.warning(f"Unparseable price: {price}")
        return 0


def _clean_description(description: str) -> str:
    """
    Cleans description: removes weight/size mentions, trims length.

    Args:
        description: Raw description string.

    Returns:
        Cleaned description.
    """
    if not description:
        return ""

    cleaned = description.strip()

    # Remove parenthetical weight/size info like "(500 g)", "(1 kg)"
    cleaned = re.sub(
        r"\(\s*\d+\s*(?:kg|g|gm|ml|ltr?|pcs?|pieces?|pack|inch|cm)[\s\w]*\)",
        "", cleaned, flags=re.IGNORECASE
    )

    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    # Cap length
    return cleaned[:200]


def _is_category_relevant(name: str, category: str) -> bool:
    """
    Checks if a product name is relevant to the category
    (i.e., it's an actual product, not a tool/supply).

    Args:
        name: Cleaned product name.
        category: The target category.

    Returns:
        True if the product is relevant to the category.
    """
    name_lower = name.lower()

    for keyword in NON_PRODUCT_KEYWORDS:
        if keyword in name_lower:
            logger.debug(f"Filtered non-product item: '{name}' (keyword: {keyword})")
            return False

    return True


def _validate_image_url(url: str) -> str:
    """
    Validates and returns image URL, or empty string if invalid.

    Args:
        url: Raw image URL string.

    Returns:
        Valid absolute URL or empty string.
    """
    if not url or not isinstance(url, str):
        return ""

    url = url.strip()

    try:
        parsed = urlparse(url)
        if parsed.scheme in ("http", "https") and parsed.netloc:
            return url
    except Exception:
        pass

    return ""


def clean_products(
    products: List[dict], target_category: str
) -> List[dict]:
    """
    Cleans and normalizes a list of extracted product dicts.

    Args:
        products: Products from LLM RAG extraction.
        target_category: The category being ingested.

    Returns:
        List of cleaned product dicts (invalid/irrelevant products filtered out).
    """
    cleaned = []
    seen_names = set()
    category_value = target_category.strip().lower().replace(" ", "_")

    for product in products:
        try:
            name = _clean_name(product.get("name", ""))
            price = _clean_price(product.get("price"))
            description = _clean_description(product.get("description", ""))
            image_url = _validate_image_url(product.get("image_url", ""))

            # Skip products with no name or zero price
            if not name or price <= 0:
                logger.debug(f"Filtered invalid product: {product}")
                continue

            # Skip non-category items (tools, supplies, equipment)
            if not _is_category_relevant(name, target_category):
                continue

            # Skip duplicate names (case-insensitive)
            name_key = name.lower()
            if name_key in seen_names:
                logger.debug(f"Filtered duplicate name: {name}")
                continue
            seen_names.add(name_key)

            cleaned_product = {
                "name": name,
                "category": category_value,
                "price": price,
                "description": description,
                "image_url": image_url,
            }
            cleaned.append(cleaned_product)

        except Exception as e:
            logger.warning(f"Error cleaning product {product}: {e}")
            continue

    logger.info(
        f"Cleaned {len(cleaned)}/{len(products)} products "
        f"for category '{target_category}'"
    )
    return cleaned
