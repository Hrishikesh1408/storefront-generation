"""
MongoDB Database Configuration.

This module sets up the connection to the MongoDB database using Motor (asyncio).
It exports the database instance and references to all major collections used in the application.
"""

import os
import certifi

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient

# Load environment variables from .env file
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

# Initialize async MongoDB client with certifi for macOS SSL verification
client = AsyncIOMotorClient(MONGO_URI, tlsCAFile=certifi.where())

# Get reference to the main database
db = client["storefront"]

# Define and export collection references
users_collection = db["users"]
stores_collection = db["stores"]
products_collection = db["products"]
images_collection = db["images"]
storefronts_collection = db["storefronts"]
