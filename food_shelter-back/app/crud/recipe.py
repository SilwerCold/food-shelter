from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.recipe import Recipe as RecipeModel
from app.schemas.recipe import RecipeCreate
from app.models.user import User as UserModel


def get_recipes(db: Session, skip: int = 0, limit: int = 100):
    """
    Получить список рецептов с пагинацией
    """
    return db.query(RecipeModel).offset(skip).limit(limit).all()


def get_recipe(db: Session, recipe_id: int):
    """
    Получить рецепт по ID
    """
    obj = db.query(RecipeModel).filter(RecipeModel.id == recipe_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return obj


def create_recipe(db: Session, item: RecipeCreate):
    """
    Создать новый рецепт (не генерируемый)
    """
    # Проверяем пользователя
    if not db.query(UserModel).filter(UserModel.id == item.user_id).first():
        raise HTTPException(status_code=404, detail="User not found")
    # Сохраняем базовые поля; ингредиенты будут через отдельный эндпоинт
    new_obj = RecipeModel(
        user_id=item.user_id,
        title=item.title,
        meal_type=item.meal_type,
        prep_time=item.prep_time,
        servings=item.servings,
        is_generated=False
    )
    db.add(new_obj)
    db.commit()
    db.refresh(new_obj)
    return new_obj


def update_recipe(db: Session, recipe_id: int, item: RecipeCreate):
    """
    Обновить поля рецепта
    """
    obj = get_recipe(db, recipe_id)
    obj.title = item.title
    obj.meal_type = item.meal_type
    obj.prep_time = item.prep_time
    obj.servings = item.servings
    db.commit()
    db.refresh(obj)
    return obj


def delete_recipe(db: Session, recipe_id: int):
    """
    Удалить рецепт и связанные ингредиенты
    """
    obj = get_recipe(db, recipe_id)
    db.delete(obj)
    db.commit()
    return None
