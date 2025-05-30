from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.shopping_list import ShoppingList as ShoppingListModel
from app.models.user import User as UserModel
from app.schemas.shopping_list import ShoppingListCreate


def get_shopping_lists(db: Session, skip: int = 0, limit: int = 100):
    """
    Получить список всех списков покупок по пользователям
    """
    return db.query(ShoppingListModel).offset(skip).limit(limit).all()


def get_shopping_list(db: Session, list_id: int):
    """
    Получить конкретный список покупок по ID
    """
    obj = db.query(ShoppingListModel).filter(
        ShoppingListModel.id == list_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ShoppingList not found")
    return obj


def create_shopping_list(db: Session, item: ShoppingListCreate):
    """
    Создать новый список покупок для пользователя
    """
    # Проверяем, что пользователь существует
    if not db.query(UserModel).filter(UserModel.id == item.user_id).first():
        raise HTTPException(status_code=404, detail="User not found")
    new_list = ShoppingListModel(user_id=item.user_id, name=item.name)
    db.add(new_list)
    db.commit()
    db.refresh(new_list)
    return new_list


def update_shopping_list(db: Session, list_id: int, item: ShoppingListCreate):
    """
    Обновить имя списка покупок
    """
    obj = get_shopping_list(db, list_id)
    obj.name = item.name
    db.commit()
    db.refresh(obj)
    return obj


def delete_shopping_list(db: Session, list_id: int):
    """
    Удалить список покупок
    """
    obj = get_shopping_list(db, list_id)
    db.delete(obj)
    db.commit()
    return None
