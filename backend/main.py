"""
Main FastAPI Application Entrypoint.

Registers routers, sets up the ASGI application, and provides a health check endpoint.
"""
from fastapi import FastAPI

from db.mongo import users_collection
from routes.admin import router as admin_router
from routes.auth import router as auth_router
from routes.store import router as store_router

app = FastAPI(title="Storefront Generation API")

# Register feature-specific routers
app.include_router(admin_router)
app.include_router(store_router)
app.include_router(auth_router, prefix="/auth")


@app.get("/")
async def test_db():
    """
    Health check endpoint. Unconditionally inserts a test user to verify DB access.
    """
    await users_collection.insert_one({"name": "test_user"})

    return {"message": "MongoDB connected"}
