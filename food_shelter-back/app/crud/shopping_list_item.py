from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.shopping_list_item import ShoppingListItem as ItemModel
from app.schemas.shopping_list_item import ShoppingListItemCreate
from app.models.shopping_list import ShoppingList as ListModel
from app.models.product import Product as ProductModel


def get_items(db: Session, skip: int = 0, limit: int = 100):
    """
    Получить все элементы списков покупок с пагинацией
    """
    return db.query(ItemModel).offset(skip).limit(limit).all()


def get_item(db: Session, list_id: int, product_id: int):
    """
    Получить конкретный элемент списка покупок
    """
    obj = db.query(ItemModel).filter(
        ItemModel.list_id == list_id,
        ItemModel.product_id == product_id
    ).first()
    if not obj:
        raise HTTPException(
            status_code=404, detail="ShoppingListItem not found")
    return obj


def create_item(db: Session, item: ShoppingListItemCreate):
    """
    Добавить элемент в список покупок
    """
    # Проверка существования списка и продукта
    if not db.query(ListModel).filter(ListModel.id == item.list_id).first():
        raise HTTPException(status_code=404, detail="ShoppingList not found")
    if not db.query(ProductModel).filter(ProductModel.id == item.product_id).first():
        raise HTTPException(status_code=404, detail="Product not found")
    # Проверка дубликата
    existing = db.query(ItemModel).filter(
        ItemModel.list_id == item.list_id,
        ItemModel.product_id == item.product_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=400, detail="Item already exists in shopping list")
    new_obj = ItemModel(
        list_id=item.list_id,
        product_id=item.product_id,
        quantity=item.quantity,
        is_bought=item.is_bought
    )
    db.add(new_obj)
    db.commit()
    db.refresh(new_obj)
    return new_obj


def update_item(db: Session, list_id: int, product_id: int, item: ShoppingListItemCreate):
    """
    Обновить элемент списка покупок
    """
    obj = get_item(db, list_id, product_id)
    obj.quantity = item.quantity
    obj.is_bought = item.is_bought
    db.commit()
    db.refresh(obj)
    return obj


def delete_item(db: Session, list_id: int, product_id: int):
    """
    Удалить элемент из списка покупок
    """
    obj = get_item(db, list_id, product_id)
    db.delete(obj)
    db.commit()
    return None
