from app.core.database import get_db
from app.schemas.recipe import Recipe, RecipeCreate
import app.crud.recipe as crud
from sqlalchemy.orm import Session
from typing import List
from fastapi import APIRouter, Depends


router = APIRouter(
    tags=["recipes"]
)


@router.get("/", response_model=List[Recipe])
def read_recipes(skip: int = 0, limit: int = 100, user_id: int | None = None, db: Session = Depends(get_db)):
    """Получить список рецептов"""
    return crud.get_recipes(db, skip=skip, limit=limit, user_id=user_id)


@router.post("/", response_model=Recipe)
def create_recipe(item: RecipeCreate, db: Session = Depends(get_db)):
    """Создать новый рецепт"""
    return crud.create_recipe(db, item)


@router.get("/{recipe_id}", response_model=Recipe)
def read_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """Получить рецепт по ID"""
    return crud.get_recipe(db, recipe_id)


@router.put("/{recipe_id}", response_model=Recipe)
def update_recipe(recipe_id: int, item: RecipeCreate, db: Session = Depends(get_db)):
    """Обновить рецепт"""
    return crud.update_recipe(db, recipe_id, item)


@router.delete("/{recipe_id}", status_code=204)
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """Удалить рецепт"""
    crud.delete_recipe(db, recipe_id)
    return None
