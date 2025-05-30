from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.recipe_ingredient import RecipeIngredient as RIModel
from app.schemas.recipe_ingredient import RecipeIngredientBase
from app.models.recipe import Recipe as RecipeModel
from app.models.product import Product as ProductModel


def get_ingredients(db: Session, recipe_id: int):
    """
    Получить все ингредиенты для рецепта
    """
    # Проверка рецепта
    if not db.query(RecipeModel).filter(RecipeModel.id == recipe_id).first():
        raise HTTPException(status_code=404, detail="Recipe not found")
    return db.query(RIModel).filter(RIModel.recipe_id == recipe_id).all()


def add_ingredient(db: Session, recipe_id: int, item: RecipeIngredientBase):
    """
    Добавить ингредиент к рецепту
    """
    # Проверки
    if not db.query(RecipeModel).filter(RecipeModel.id == recipe_id).first():
        raise HTTPException(status_code=404, detail="Recipe not found")
    if not db.query(ProductModel).filter(ProductModel.id == item.product_id).first():
        raise HTTPException(status_code=404, detail="Product not found")
    existing = db.query(RIModel).filter(
        RIModel.recipe_id == recipe_id,
        RIModel.product_id == item.product_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=400, detail="Ingredient already exists")
    new_obj = RIModel(
        recipe_id=recipe_id,
        product_id=item.product_id,
        quantity=item.quantity,
        is_required=item.is_required
    )
    db.add(new_obj)
    db.commit()
    db.refresh(new_obj)
    return new_obj


def update_ingredient(db: Session, recipe_id: int, product_id: int, item: RecipeIngredientBase):
    """
    Обновить ингредиент рецепта
    """
    obj = db.query(RIModel).filter(
        RIModel.recipe_id == recipe_id,
        RIModel.product_id == product_id
    ).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    obj.quantity = item.quantity
    obj.is_required = item.is_required
    db.commit()
    db.refresh(obj)
    return obj


def delete_ingredient(db: Session, recipe_id: int, product_id: int):
    """
    Удалить ингредиент из рецепта
    """
    obj = db.query(RIModel).filter(
        RIModel.recipe_id == recipe_id,
        RIModel.product_id == product_id
    ).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    db.delete(obj)
    db.commit()
    return None
