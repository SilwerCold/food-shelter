from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session

import app.crud.shopping_list as crud
from app.schemas.shopping_list import ShoppingList, ShoppingListCreate
from app.core.database import get_db

router = APIRouter(
    tags=["shopping-lists"]
)


@router.get("/", response_model=List[ShoppingList])
def read_shopping_lists(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Получить все списки покупок с пагинацией
    """
    return crud.get_shopping_lists(db, skip=skip, limit=limit)


@router.post("/", response_model=ShoppingList)
def create_shopping_list(item: ShoppingListCreate, db: Session = Depends(get_db)):
    """
    Создать новый список покупок
    """
    return crud.create_shopping_list(db, item)


@router.get("/{list_id}", response_model=ShoppingList)
def read_shopping_list(list_id: int, db: Session = Depends(get_db)):
    """
    Получить список покупок по ID
    """
    return crud.get_shopping_list(db, list_id)


@router.put("/{list_id}", response_model=ShoppingList)
def update_shopping_list(list_id: int, item: ShoppingListCreate, db: Session = Depends(get_db)):
    """
    Обновить имя списка покупок
    """
    return crud.update_shopping_list(db, list_id, item)


@router.delete("/{list_id}", status_code=204)
def delete_shopping_list(list_id: int, db: Session = Depends(get_db)):
    """
    Удалить список покупок
    """
    crud.delete_shopping_list(db, list_id)
    return None
