from fastapi import FastAPI
from db.mongo import users_collection

app = FastAPI()

@app.get("/")
def test_db():

    users_collection.insert_one({
        "name": "test_user"
    })

    return {"message": "MongoDB connected"}