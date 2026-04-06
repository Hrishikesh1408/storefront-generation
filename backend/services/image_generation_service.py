import os
import asyncio
from diffusers import StableDiffusionPipeline
import torch
from db.mongo import db

products_collection = db["products"]
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")

# Note: loading the pipeline can take some time when the module is imported
print("Loading Stable Diffusion Pipeline...")
pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5"
)
pipe = pipe.to("cpu")
print("Stable Diffusion Pipeline loaded.")


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


async def generate_product_image_async(product_name: str, category_value: str, product_id: str):
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
        
        # Update the product in the database with the generated image URL
        from bson import ObjectId
        await products_collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": {"image_url": image_url}}
        )
        print(f"Successfully generated and saved image for product {product_id} at {image_url}")
        
    except Exception as e:
        print(f"Failed to generate image for product {product_id}: {e}")
