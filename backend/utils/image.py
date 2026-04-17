import os
import random

BASE_URL = os.getenv("BASE_URL")


def get_random_image() -> str:
    folder = "images/clothing"

    try:
        files = [
            f for f in os.listdir(folder)
            if f.lower().endswith((".jpg", ".jpeg", ".png"))
        ]

        if not files:
            raise Exception("No images found")

        chosen = random.choice(files)
        return f"{BASE_URL}/images/clothing/{chosen}"

    except Exception as e:
        print("Image error:", e)
        return f"{BASE_URL}/images/default.jpg"