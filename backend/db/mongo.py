import os
from pymongo import MongoClient
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = AsyncIOMotorClient(os.getenv("MONGO_URI"))

db = client["storefront"]

users_collection = db["users"]
stores_collection = db["stores"]
products_collection = db["products"]
images_collection = db["images"]
storefronts_collection = db["storefronts"]