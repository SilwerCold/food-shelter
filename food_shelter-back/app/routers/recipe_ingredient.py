from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session

import app.crud.recipe_ingredient as crud
from app.schemas.recipe_ingredient import RecipeIngredient, RecipeIngredientBase
from app.core.database import get_db

router = APIRouter(
    tags=["recipe-ingredients"]
)


@router.get("/", response_model=List[RecipeIngredient])
def read_ingredients(recipe_id: int, db: Session = Depends(get_db)):
    """Получить ингредиенты рецепта"""
    return crud.get_ingredients(db, recipe_id)


@router.post("/", response_model=RecipeIngredient)
def add_ingredient(recipe_id: int, item: RecipeIngredientBase, db: Session = Depends(get_db)):
    """Добавить ингредиент"""
    return crud.add_ingredient(db, recipe_id, item)


@router.put("/{product_id}", response_model=RecipeIngredient)
def update_ingredient(recipe_id: int, product_id: int, item: RecipeIngredientBase, db: Session = Depends(get_db)):
    """Обновить ингредиент"""
    return crud.update_ingredient(db, recipe_id, product_id, item)


@router.delete("/{product_id}", status_code=204)
def delete_ingredient(recipe_id: int, product_id: int, db: Session = Depends(get_db)):
    """Удалить ингредиент"""
    crud.delete_ingredient(db, recipe_id, product_id)
    return None
