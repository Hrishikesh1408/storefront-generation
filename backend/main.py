from fastapi import FastAPI
from db.mongo import users_collection
from routes.auth import router as auth_router

app = FastAPI()

app.include_router(auth_router, prefix="/auth")
@app.get("/")
def test_db():

    users_collection.insert_one({
        "name": "test_user"
    })

    return {"message": "MongoDB connected"}