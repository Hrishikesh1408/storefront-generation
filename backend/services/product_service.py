from db.mongo import db
from bson import ObjectId
from services.ollama_service import call_ollama_async
from utils.image import get_random_image
import json

products_collection = db["products"]


def build_prompt(store_name: str, description: str = "") -> str:
    return f"""
Generate exactly 6 clothing products for an online store.

Store Name: {store_name}
Store Description: {description}

Use the description STRICTLY to determine:
- product type
- style
- pricing

Return ONLY valid JSON array with:
- name
- description (max 12 words)
- price (between 10 and 150)

No extra text.
"""


def parse_products(raw: str):
    try:
        return json.loads(raw)
    except Exception as e:
        print("JSON parse error:", e)
        print("RAW RESPONSE:", raw)
        return []


async def generate_products_for_store(store_id: str):
    store = await db["stores"].find_one({"_id": ObjectId(store_id)})

    if not store:
        return {"error": "Store not found"}

    # Update store status to pending during generation
    await db["stores"].update_one(
        {"_id": ObjectId(store_id)},
        {"$set": {"status": "pending"}}
    )

    prompt = build_prompt(
        store["name"],
        store.get("description", "")
    )

    raw = await call_ollama_async(prompt)
    products = parse_products(raw)

    final_products = []

    for p in products:
        try:
            product = {
                "store_id": ObjectId(store_id),
                "name": p.get("name"),
                "description": p.get("description"),
                "price": float(p.get("price", 0)),
                "image_url": get_random_image(),
                "selected": False
            }

            result = await products_collection.insert_one(product)
            product["_id"] = str(result.inserted_id)

            final_products.append(product)

        except Exception as e:
            print("Product error:", e)

    for p in final_products:
        p["store_id"] = str(p["store_id"])

    # Update store status to active after successful generation
    await db["stores"].update_one(
        {"_id": ObjectId(store_id)},
        {"$set": {"status": "active"}}
    )

    return final_products

async def get_products_by_store(store_id: str):
    products = []
    async for p in products_collection.find({"store_id": ObjectId(store_id)}):
        p["_id"] = str(p["_id"])
        p["store_id"] = str(p["store_id"])
        products.append(p)
    return products

async def toggle_product_selection(product_id: str):
    product = await products_collection.find_one({"_id": ObjectId(product_id)})
    if not product:
        return {"error": "Product not found"}
    
    new_status = not product.get("selected", False)
    await products_collection.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": {"selected": new_status}}
    )
    return {"status": "success", "selected": new_status}

async def add_manual_product(store_id: str, data: dict):
    product = {
        "store_id": ObjectId(store_id),
        "name": data.get("name"),
        "description": data.get("description"),
        "price": float(data.get("price", 0)),
        "image_url": data.get("image_url", get_random_image()),
        "selected": True
    }
    result = await products_collection.insert_one(product)
    product["_id"] = str(result.inserted_id)
    product["store_id"] = str(product["store_id"])

    # Ensure store is marked active if user manually adds a product
    await db["stores"].update_one(
        {"_id": ObjectId(store_id)},
        {"$set": {"status": "active"}}
    )

    return product