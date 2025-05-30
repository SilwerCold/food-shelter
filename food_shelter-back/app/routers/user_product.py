from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from app.schemas.user_product import UserProduct, UserProductCreate
from app.core.database import get_db
import app.crud.user_product as crud

router = APIRouter(
    tags=["user-products"]
)


@router.get("/", response_model=List[UserProduct])
def read_user_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Получить список продуктов пользователя с поддержкой пагинации
    """
    return crud.get_user_products(db, skip=skip, limit=limit)


@router.post("/", response_model=UserProduct)
def create_user_product(item: UserProductCreate, db: Session = Depends(get_db)):
    """
    Добавить продукт в список имеющихся у пользователя
    """
    return crud.create_user_product(db, item)


@router.get("/{user_id}/{product_id}", response_model=UserProduct)
def read_user_product(user_id: int, product_id: int, db: Session = Depends(get_db)):
    """
    Получить информацию о конкретном продукте пользователя
    """
    return crud.get_user_product(db, user_id, product_id)


@router.put("/{user_id}/{product_id}", response_model=UserProduct)
def update_user_product(user_id: int, product_id: int, item: UserProductCreate, db: Session = Depends(get_db)):
    """
    Обновить количество или срок годности продукта пользователя
    """
    return crud.update_user_product(db, user_id, product_id, item)


@router.delete("/{user_id}/{product_id}", status_code=204)
def delete_user_product(user_id: int, product_id: int, db: Session = Depends(get_db)):
    """
    Удалить продукт из списка имеющихся у пользователя
    """
    crud.delete_user_product(db, user_id, product_id)
    return None
