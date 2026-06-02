from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.recipe import Recipe as RecipeModel
from app.models.recipe_ingredient import RecipeIngredient as RecipeIngredientModel
from app.models.user import User as UserModel
from app.schemas.recipe import RecipeCreate


def get_recipes(db: Session, skip: int = 0, limit: int = 100, user_id: Optional[int] = None):
    """
    Получить список рецептов с пагинацией и опциональным фильтром по пользователю.
    """
    query = db.query(RecipeModel)
    if user_id is not None:
        query = query.filter(RecipeModel.user_id == user_id)
    return query.order_by(RecipeModel.created_at.desc()).offset(skip).limit(limit).all()


def get_recipe(db: Session, recipe_id: int):
    """
    Получить рецепт по ID.
    """
    obj = db.query(RecipeModel).filter(RecipeModel.id == recipe_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return obj


def create_recipe(db: Session, item: RecipeCreate):
    """
    Создать новый рецепт и сохранить переданные ингредиенты.
    """
    if not db.query(UserModel).filter(UserModel.id == item.user_id).first():
        raise HTTPException(status_code=404, detail="User not found")

    new_obj = RecipeModel(
        user_id=item.user_id,
        title=item.title,
        meal_type=item.meal_type,
        prep_time=item.prep_time,
        servings=item.servings,
        ingredient_strings=item.ingredient_strings,
        instructions=item.instructions,
        note=item.note,
        liked=item.liked,
        is_generated=item.is_generated,
    )
    db.add(new_obj)
    db.flush()

    for ingredient in item.ingredients:
        db.add(
            RecipeIngredientModel(
                recipe_id=new_obj.id,
                product_id=ingredient.product_id,
                quantity=ingredient.quantity,
                is_required=ingredient.is_required,
            )
        )

    db.commit()
    db.refresh(new_obj)
    return new_obj


def update_recipe(db: Session, recipe_id: int, item: RecipeCreate):
    """
    Обновить поля рецепта и заменить набор связанных ингредиентов.
    """
    obj = get_recipe(db, recipe_id)
    obj.title = item.title
    obj.meal_type = item.meal_type
    obj.prep_time = item.prep_time
    obj.servings = item.servings
    obj.ingredient_strings = item.ingredient_strings
    obj.instructions = item.instructions
    obj.note = item.note
    obj.liked = item.liked
    obj.is_generated = item.is_generated

    db.query(RecipeIngredientModel).filter(
        RecipeIngredientModel.recipe_id == recipe_id
    ).delete()
    for ingredient in item.ingredients:
        db.add(
            RecipeIngredientModel(
                recipe_id=recipe_id,
                product_id=ingredient.product_id,
                quantity=ingredient.quantity,
                is_required=ingredient.is_required,
            )
        )

    db.commit()
    db.refresh(obj)
    return obj


def delete_recipe(db: Session, recipe_id: int):
    """
    Удалить рецепт и связанные ингредиенты.
    """
    obj = get_recipe(db, recipe_id)
    db.delete(obj)
    db.commit()
    return None
