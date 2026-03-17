from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.google_auth import verify_google_token
from services.user_service import find_or_create_user
from services.jwt_service import create_jwt

router = APIRouter()


class GoogleToken(BaseModel):
    token: str


@router.post("/google")
async def google_login(data: GoogleToken):

    user_data = verify_google_token(data.token)

    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await find_or_create_user(user_data)

    jwt_token = create_jwt(user)

    return {
        "token": jwt_token,
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "picture": user["picture"],
            "role": user["role"],
        }
    }