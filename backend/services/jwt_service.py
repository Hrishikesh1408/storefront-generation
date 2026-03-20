from jose import jwt
from fastapi import Request, HTTPException
from jose.exceptions import JWTError
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

def verify_jwt(request: Request):
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing token")

    parts = auth_header.split(" ")

    if len(parts) != 2 or parts[0] != "Bearer":
        raise HTTPException(status_code=401, detail="Invalid token format")

    token = parts[1]

    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        return payload

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")