from datetime import datetime, timezone

def create_user_document(user_data):

    return {
        "google_id": user_data["google_id"],
        "email": user_data["email"],
        "name": user_data["name"],
        "picture": user_data["picture"],
        "created_at": datetime.now(timezone.utc)
    }