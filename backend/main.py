from fastapi import FastAPI
from db.mongo import users_collection
from routes.auth import router as auth_router
from routes.admin import router as admin_router

app = FastAPI()

app.include_router(admin_router)

app.include_router(auth_router, prefix="/auth")
@app.get("/")
async def test_db():

    await users_collection.insert_one({
        "name": "test_user"
    })

    return {"message": "MongoDB connected"}