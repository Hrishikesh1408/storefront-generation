from jose import jwt
from datetime import datetime, timedelta, timezone
import os

SECRET = os.getenv("JWT_SECRET")

def create_jwt(user):

    payload = {
        "user_id": str(user["_id"]),
        "email": user["email"],
        "role": user["role"],
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }

    token = jwt.encode(payload, SECRET, algorithm="HS256")

    return token