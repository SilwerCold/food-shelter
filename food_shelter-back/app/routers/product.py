from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from app.schemas.product import Product, ProductCreate
from app.core.database import get_db
import app.crud.product as crud

router = APIRouter(
    tags=["products"]
)


@router.get("/", response_model=List[Product])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Получить список продуктов с поддержкой пагинации
    """
    return crud.get_products(db, skip=skip, limit=limit)


@router.post("/", response_model=Product)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """
    Создать новый продукт
    """
    return crud.create_product(db, product)


@router.get("/{product_id}", response_model=Product)
def read_product(product_id: int, db: Session = Depends(get_db)):
    """
    Получить продукт по ID
    """
    return crud.get_product(db, product_id)


@router.put("/{product_id}", response_model=Product)
def update_product(product_id: int, product: ProductCreate, db: Session = Depends(get_db)):
    """
    Обновить существующий продукт
    """
    return crud.update_product(db, product_id, product)


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """
    Удалить продукт
    """
    crud.delete_product(db, product_id)
    return None
