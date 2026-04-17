"""
Category Routes.

Endpoints for managing store categories.
GET is public (used by merchant dashboard), POST/DELETE are admin operations.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.category_service import get_all_categories, add_category, delete_category

router = APIRouter()


class CategoryCreate(BaseModel):
    """Payload model for creating a category."""
    label: str


@router.get("/categories")
async def list_categories():
    """
    Lists all available store categories.
    """
    categories = await get_all_categories()
    return {"categories": categories}


@router.post("/categories")
async def create_category(data: CategoryCreate):
    """
    Creates a new store category. Value is auto-generated from the label.
    """
    if not data.label.strip():
        raise HTTPException(status_code=400, detail="Category label is required")

    category = await add_category(data.label)

    if not category:
        raise HTTPException(status_code=400, detail="Category already exists")

    return category


@router.delete("/categories/{category_id}")
async def remove_category(category_id: str):
    """
    Deletes a category by ID.
    """
    deleted = await delete_category(category_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Category not found")

    return {"message": "Category deleted successfully"}
