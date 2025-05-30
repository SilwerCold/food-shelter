from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session

from app.schemas.shopping_list_item import ShoppingListItem, ShoppingListItemCreate
from app.core.database import get_db
import app.crud.shopping_list_item as crud

router = APIRouter(
    tags=["shopping-list-items"]
)


@router.get("/", response_model=List[ShoppingListItem])
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Получить элементы списков покупок с пагинацией
    """
    return crud.get_items(db, skip=skip, limit=limit)


@router.post("/", response_model=ShoppingListItem)
def create_item(item: ShoppingListItemCreate, db: Session = Depends(get_db)):
    """
    Добавить элемент в список покупок
    """
    return crud.create_item(db, item)


@router.get("/{list_id}/{product_id}", response_model=ShoppingListItem)
def read_item(list_id: int, product_id: int, db: Session = Depends(get_db)):
    """
    Получить конкретный элемент по composite ключу
    """
    return crud.get_item(db, list_id, product_id)


@router.put("/{list_id}/{product_id}", response_model=ShoppingListItem)
def update_item(list_id: int, product_id: int, item: ShoppingListItemCreate, db: Session = Depends(get_db)):
    """
    Обновить элемент списка покупок
    """
    return crud.update_item(db, list_id, product_id, item)


@router.delete("/{list_id}/{product_id}", status_code=204)
def delete_item(list_id: int, product_id: int, db: Session = Depends(get_db)):
    """
    Удалить элемент списка покупок
    """
    crud.delete_item(db, list_id, product_id)
    return None
