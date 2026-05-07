import os
import asyncio
from diffusers import StableDiffusionPipeline
import torch
from db.mongo import db

products_collection = db["products"]
stores_collection = db["stores"]
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")

# Note: loading the pipeline can take some time when the module is imported
print("Loading Stable Diffusion Pipeline...")
pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5"
)
# Use Apple Silicon GPU (MPS) if available, otherwise fallback to CPU
device = "mps" if torch.backends.mps.is_available() else "cpu"
pipe = pipe.to(device)
print(f"Stable Diffusion Pipeline loaded on {device}.")


def _generate_and_save_image_sync(product_name: str, category_value: str, product_id: str) -> str:
    """Synchronous function to generate and save an image."""
    prompt = f"a {product_name}, white background, ecommerce style"
    print(f"Generating image for: {product_name} | Prompt: {prompt}")
    
    # Generate image
    image = pipe(prompt).images[0]
    
    # Ensure directory exists
    dir_path = os.path.join("images", category_value)
    os.makedirs(dir_path, exist_ok=True)
    
    # Save the image
    file_path = os.path.join(dir_path, f"{product_id}.png")
    image.save(file_path)
    
    # Ensure URL is formatted with forward slashes
    url_path = f"images/{category_value}/{product_id}.png"
    return f"{BASE_URL}/{url_path}"


async def generate_product_image_async(product_name: str, category_value: str, product_id: str, store_id: str = None):
    """
    Asynchronously generates an image for a product and updates the database.
    Since SD is CPU intensive and blocking, we run it in a thread pool.
    """
    try:
        image_url = await asyncio.to_thread(
            _generate_and_save_image_sync,
            product_name,
            category_value,
            product_id
        )
        
        from bson import ObjectId
        
        if store_id:
            # Update the image_url inside the specific store's products map
            await stores_collection.update_one(
                {"_id": ObjectId(store_id)},
                {"$set": {f"products.{product_id}.image_url": image_url}}
            )
            print(f"Successfully generated and saved image for product {product_id} in store {store_id} at {image_url}")
        else:
            # Legacy fallback
            try:
                doc_id = ObjectId(product_id) if len(product_id) == 24 else product_id
            except Exception:
                doc_id = product_id
            await products_collection.update_one(
                {"_id": doc_id},
                {"$set": {"image_url": image_url}}
            )
            print(f"Successfully generated and saved image for product {product_id} at {image_url}")
        
    except Exception as e:
        print(f"Failed to generate image for product {product_id}: {e}")
