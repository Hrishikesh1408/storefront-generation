"""
Store Operations Service.

Handles database operations related to merchants' storefronts.
"""
import asyncio
from bson import ObjectId
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from services.ollama_service import get_chat_model

from db.mongo import db
from models.store_model import create_store_document

store_collection = db["stores"]


class StoreDetails(BaseModel):
    name: str = Field(description="A catchy, appropriate name for the store")
    category: str = Field(description="The primary category (e.g. bakery, clothing, electronics, restaurant)")
    description: str = Field(description="A brief description of the store and what it sells")

async def deduce_store_details(prompt: str) -> dict | None:
    """Uses LLM to deduce store name, category, and description from a prompt."""
    parser = JsonOutputParser(pydantic_object=StoreDetails)
    prompt_template = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant that parses merchant requests into structured store details.\n{format_instructions}"),
        ("human", "Extract the store details from this request: {prompt}")
    ])
    model = get_chat_model(temperature=0.2)
    chain = prompt_template | model | parser
    try:
        result = await chain.ainvoke({
            "prompt": prompt,
            "format_instructions": parser.get_format_instructions()
        })
        return result
    except Exception as e:
        print(f"Error deducing store details: {e}")
        return None

async def create_store_from_prompt(user_id: str, store_details: dict) -> dict:
    """Creates a new store and triggers background product generation."""
    new_store = create_store_document(user_id, store_details)
    
    # Store prompt for reference if available
    if "prompt" in store_details:
        new_store["merchant_prompt"] = store_details["prompt"]

    result = await store_collection.insert_one(new_store)
    store_id = str(result.inserted_id)
    new_store["_id"] = store_id
    new_store["owner_id"] = str(new_store["owner_id"])

    # Trigger background product generation
    from services.product_generation_service import generate_store_products
    asyncio.create_task(generate_store_products(store_id, store_details))

    return new_store

async def update_store_details(user_id: str, data: dict) -> dict | None:
    """Updates the store's basic details."""
    result = await store_collection.find_one_and_update(
        {"owner_id": ObjectId(user_id)},
        {"$set": {
            "name": data.get("name"),
            "category": data.get("category"),
            "description": data.get("description")
        }},
        return_document=True
    )
    if result:
        result["_id"] = str(result["_id"])
        result["owner_id"] = str(result["owner_id"])
        return result
    return None


async def get_store_by_user(user_id: str) -> dict | None:
    """
    Retrieves a store by its owner's user ID.
    
    Args:
        user_id (str): Database ID of the user.
        
    Returns:
        dict | None: The store document if found, None otherwise.
    """
    store = await store_collection.find_one({"owner_id": ObjectId(user_id)})

    if store:
        store["_id"] = str(store["_id"])
        store["owner_id"] = str(store["owner_id"])

    return store


async def publish_store(user_id: str) -> bool:
    """
    Publishes a store by updating its status to 'active'.
    
    Args:
        user_id (str): Database ID of the user.
        
    Returns:
        bool: True if updated successfully, False otherwise.
    """
    result = await store_collection.update_one(
        {"owner_id": ObjectId(user_id)},
        {"$set": {"status": "active"}}
    )
    
    return result.modified_count > 0




async def get_store_by_id(store_id: str) -> dict | None:
    """
    Retrieves a store by its ID.
    
    Args:
        store_id (str): Database ID of the store.
        
    Returns:
        dict | None: The store document if found, None otherwise.
    """
    store = await store_collection.find_one({"_id": ObjectId(store_id)})

    if store:
        store["_id"] = str(store["_id"])
        store["owner_id"] = str(store["owner_id"])

    return store


async def get_all_active_stores() -> list:
    """
    Retrieves all stores that have an 'active' status.
    
    Returns:
        list: A list of active store documents.
    """
    cursor = store_collection.find({"status": "active"})
    stores = await cursor.to_list(length=100)
    
    for store in stores:
        store["_id"] = str(store["_id"])
        store["owner_id"] = str(store["owner_id"])
        
    return stores

async def update_product_price_in_store(user_id: str, product_id: str, price: float) -> bool:
    """
    Updates the price of a product in the store.
    
    Args:
        user_id (str): Database ID of the user.
        product_id (str): Database ID of the product.
        price (float): The new price of the product.
        
    Returns:
        bool: True if updated successfully, False otherwise.
    """
    # First, handle case where it might be a boolean (legacy)
    await store_collection.update_one(
        {"owner_id": ObjectId(user_id), f"products.{product_id}": {"$not": {"$type": "object"}}},
        {"$set": {f"products.{product_id}": {}}}
    )

    result = await store_collection.update_one(
        {"owner_id": ObjectId(user_id), f"products.{product_id}": {"$exists": True}},
        {"$set": {f"products.{product_id}.price": price}}
    )
    return result.modified_count > 0

async def update_product_stock_in_store(user_id: str, product_id: str, stock: int) -> bool:
    """
    Updates the stock count of a product in the store.
    
    Args:
        user_id (str): Database ID of the user.
        product_id (str): Database ID of the product.
        stock (int): The new stock count.
        
    Returns:
        bool: True if updated successfully, False otherwise.
    """
    # First, handle case where it might be a boolean (legacy)
    await store_collection.update_one(
        {"owner_id": ObjectId(user_id), f"products.{product_id}": {"$not": {"$type": "object"}}},
        {"$set": {f"products.{product_id}": {}}}
    )

    result = await store_collection.update_one(
        {"owner_id": ObjectId(user_id), f"products.{product_id}": {"$exists": True}},
        {"$set": {f"products.{product_id}.stock": stock}}
    )
    return result.modified_count > 0

async def update_product_visibility_in_store(user_id: str, product_id: str, selected: bool) -> bool:
    """
    Updates the visibility status of a product in the store.
    
    Args:
        user_id (str): Database ID of the user.
        product_id (str): Database ID of the product.
        selected (bool): The new visibility status.
        
    Returns:
        bool: True if updated successfully, False otherwise.
    """
    result = await store_collection.update_one(
        {"owner_id": ObjectId(user_id), f"products.{product_id}": {"$exists": True}},
        {"$set": {f"products.{product_id}.selected": selected}}
    )
    return result.modified_count > 0
