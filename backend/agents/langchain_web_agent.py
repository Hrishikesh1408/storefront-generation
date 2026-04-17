"""
LangChain Web Search Retrieval Agent — Deterministic Pipeline.

Implements a deterministic LCEL (LangChain Expression Language) chain:
  1. SerpAPI Search  — find product page URLs for a category
  2. HTML Scrape     — fetch & clean page content via AsyncHtmlLoader
  3. Chunk           — split large documents into LLM-friendly chunks
  4. RAG Extraction  — structured LLM call to synthesize product catalog

Uses JsonOutputParser + Pydantic schema to force valid JSON from llama3
without requiring native tool-calling support.
"""

import os
import logging
from dataclasses import dataclass, field
from typing import List, Optional

from langchain_community.utilities import SerpAPIWrapper
from langchain_community.document_loaders import AsyncHtmlLoader
from langchain_community.document_transformers import Html2TextTransformer
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field

from services.ollama_service import get_chat_model

logger = logging.getLogger("agents.langchain_web")

# ──────────────────────────────────────────────
# Pydantic schema — enforces product structure
# ──────────────────────────────────────────────

class Product(BaseModel):
    """Schema for a single product in the catalog."""
    name: str = Field(description="Short, clean product name without sizes, weights, or brands")
    category: str = Field(description="Product category slug")
    price: int = Field(description="Realistic mid-range price in INR (integer)")
    description: str = Field(description="Brief 8-15 word appealing product description")
    image_url: str = Field(default="", description="Product image URL or empty string")


class ProductCatalog(BaseModel):
    """Schema for the full extracted catalog."""
    products: List[Product] = Field(description="List of curated products")


# ──────────────────────────────────────────────
# Result dataclass
# ──────────────────────────────────────────────

@dataclass
class WebAgentResult:
    """Result of the LangChain web retrieval pipeline."""
    products: List[dict] = field(default_factory=list)
    urls_found: int = 0
    urls_loaded: int = 0
    context_chars: int = 0
    confidence: float = 0.0
    error: Optional[str] = None


# ──────────────────────────────────────────────
# Search step
# ──────────────────────────────────────────────

def _generate_search_queries(category: str) -> List[str]:
    """Generates multiple search queries for comprehensive coverage."""
    return [
        f"order {category} items online menu price India",
        f"best {category} shop products menu with prices",
        f"buy {category} goods online delivery",
        f"{category} food menu prices online",
        f"popular {category} items to order list price",
    ]


async def _search_for_urls(category: str) -> List[str]:
    """
    Uses SerpAPI to search for product URLs across multiple queries.

    Returns:
        Deduplicated list of up to 20 URLs.
    """
    api_key = os.getenv("SERPAPI_API_KEY")
    if not api_key:
        logger.error("SERPAPI_API_KEY not set in environment")
        return []

    search = SerpAPIWrapper(serpapi_api_key=api_key)
    queries = _generate_search_queries(category)

    all_urls = []
    seen = set()

    for query in queries:
        try:
            # SerpAPI .results() returns structured data with links
            results = search.results(query)
            organic = results.get("organic_results", [])
            for r in organic:
                link = r.get("link", "")
                if link and link not in seen:
                    seen.add(link)
                    all_urls.append(link)
        except Exception as e:
            logger.warning(f"Search failed for query '{query}': {e}")
            continue

    final_urls = all_urls[:20]
    logger.info(f"SerpAPI search found {len(final_urls)} unique URLs for '{category}'")
    return final_urls


# ──────────────────────────────────────────────
# Scrape + Transform step
# ──────────────────────────────────────────────

async def _scrape_and_transform(urls: List[str], max_urls: int = 8) -> str:
    """
    Loads HTML from URLs and transforms to clean text using LangChain
    document loaders and transformers.

    Args:
        urls: List of URLs to scrape.
        max_urls: Maximum number of URLs to process.

    Returns:
        Aggregated clean text from all pages (truncated to fit LLM context).
    """
    # Filter out problematic domains that block basic scrapers
    skip_domains = ["instagram.com", "facebook.com", "pinterest.com", "twitter.com", "x.com", "tiktok.com"]
    filtered_urls = [u for u in urls if not any(d in u.lower() for d in skip_domains)]
    
    target_urls = filtered_urls[:max_urls]
    logger.info(f"Loading {len(target_urls)} URLs with AsyncHtmlLoader...")

    try:
        loader = AsyncHtmlLoader(target_urls, ignore_load_errors=True)
        docs = await loader.aload()
    except Exception as e:
        logger.error(f"AsyncHtmlLoader failed: {e}")
        return ""

    # Transform HTML to clean markdown/text
    transformer = Html2TextTransformer()
    cleaned_docs = transformer.transform_documents(docs)

    # Aggregate into a single context string
    context_parts = []
    total_chars = 0
    max_total = 8000  # Cap at 8000 chars to leave ample token space for Llama 3 generation

    for i, doc in enumerate(cleaned_docs):
        content = doc.page_content.strip()
        if len(content) < 50:
            continue

        remaining = max_total - total_chars
        if remaining <= 0:
            break

        chunk = content[:min(len(content), remaining, 2500)]  # cap each page
        context_parts.append(f"--- SOURCE {i + 1} ---\n{chunk}")
        total_chars += len(chunk) + 20

    aggregated = "\n\n".join(context_parts)
    logger.info(
        f"Scraped & transformed {len(cleaned_docs)} docs into "
        f"{len(aggregated)} chars of context"
    )
    return aggregated


# ──────────────────────────────────────────────
# RAG Extraction step (structured LLM call)
# ──────────────────────────────────────────────

_RAG_SYSTEM_PROMPT = """You are a product catalog curator for an e-commerce storefront.

TASK: Generate a curated list of 15-25 UNIQUE products for the "{category}" category.

REFERENCE DATA (from real websites — use this to ground your output):
{context}

STRICT RULES:
1. PRODUCT TYPES ONLY: One entry per product type. Do NOT create entries for different sizes.
2. CATEGORY RELEVANCE & FINISHED GOODS ONLY: Only items that ARE FINISHED {category} products a customer would buy to eat/consume instantly. 
   - FOR BAKERY/FOOD: Do NOT return raw ingredients (e.g. Flour, Sugar, Cocoa Powder, Compounds, Yeast, Butter). Return FINISHED goods (e.g. Black Forest Cake, Croissant, Sourdough Bread, Chocolate Chip Cookie).
   - IN GENERAL: No tools, equipment, packaging, moulds, cutters, containers, or manufacturing supplies.
3. CONCISE NAMES: Short, clean names. No sizes, weights, quantities, brand names.
4. REALISTIC PRICES: Mid-range price in INR (integer), grounded in reference data.
5. DESCRIPTIONS: Brief, appealing 8-15 word description. No sizes or weights.
6. NO HALLUCINATION: Every product must be grounded in the reference data above.
7. IMAGE URL: Always set to empty string "".

{format_instructions}
"""


async def _extract_products(
    context: str, category: str
) -> List[dict]:
    """
    Uses a LangChain chain (prompt + ChatOllama + JsonOutputParser) to
    extract structured product data from the aggregated web context.

    Args:
        context: Aggregated scraped text.
        category: The product category.

    Returns:
        List of product dicts.
    """
    parser = JsonOutputParser(pydantic_object=ProductCatalog)

    prompt = ChatPromptTemplate.from_messages([
        ("system", _RAG_SYSTEM_PROMPT),
        ("human", "Generate the product catalog for \"{category}\" now."),
    ])

    model = get_chat_model(temperature=0.2)

    # Build the deterministic LCEL chain
    chain = prompt | model | parser

    try:
        logger.info(f"Invoking LangChain extraction chain for '{category}'...")
        result = await chain.ainvoke({
            "category": category,
            "context": context,
            "format_instructions": parser.get_format_instructions(),
        })

        # Result is a dict matching ProductCatalog schema
        products = result.get("products", [])
        if not products and isinstance(result, list):
            # Some models return the list directly instead of wrapped
            products = result

        logger.info(f"LangChain extraction produced {len(products)} products")
        return products

    except Exception as e:
        logger.error(f"LangChain extraction failed: {e}")
        return []


# ──────────────────────────────────────────────
# Main pipeline entry point
# ──────────────────────────────────────────────

async def run_web_retrieval(
    category_label: str, category_value: str
) -> WebAgentResult:
    """
    Runs the full deterministic LangChain web retrieval pipeline.

    Pipeline: Search → Scrape → Transform → RAG Extract

    Args:
        category_label: Human-readable category (e.g. "Bakery").
        category_value: Normalized slug (e.g. "bakery").

    Returns:
        WebAgentResult with extracted products and pipeline stats.
    """
    result = WebAgentResult()

    # ── Step 1: Search ──
    logger.info(f"[LangChain Agent] Step 1/3: Searching for '{category_label}'...")
    urls = await _search_for_urls(category_label)
    result.urls_found = len(urls)

    if not urls:
        result.error = "No URLs found from SerpAPI search"
        return result

    # ── Step 2: Scrape & Transform ──
    logger.info(f"[LangChain Agent] Step 2/3: Scraping & transforming...")
    context = await _scrape_and_transform(urls)
    result.context_chars = len(context)
    result.urls_loaded = min(len(urls), 8)  # we process up to 8

    if len(context.strip()) < 100:
        result.error = "Insufficient content scraped from URLs"
        return result

    # ── Step 3: RAG Extract ──
    logger.info(f"[LangChain Agent] Step 3/3: Extracting products via LLM...")
    products = await _extract_products(context, category_label)

    # Tag each product with the normalized category
    for p in products:
        p["category"] = category_value
        if "image_url" not in p:
            p["image_url"] = ""

    result.products = products
    result.confidence = 1.0 if len(products) >= 10 else len(products) / 10.0

    logger.info(
        f"[LangChain Agent] Pipeline complete: {len(products)} products, "
        f"confidence={result.confidence:.2f}"
    )
    return result
