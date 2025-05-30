from sqlalchemy.orm import Session
from app.models.product import Product as ProductModel
from app.schemas.product import ProductCreate
from fastapi import HTTPException


def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(ProductModel).offset(skip).limit(limit).all()


def get_product(db: Session, product_id: int):
    product = db.query(ProductModel).filter(
        ProductModel.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


def create_product(db: Session, product_in: ProductCreate):
    # Проверка на дубликат по имени
    existing = db.query(ProductModel).filter(
        ProductModel.name == product_in.name).first()
    if existing:
        raise HTTPException(
            status_code=400, detail="Product with this name already exists")
    new_product = ProductModel(**product_in.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


def update_product(db: Session, product_id: int, product_in: ProductCreate):
    db_product = get_product(db, product_id)
    for field, value in product_in.model_dump().items():
        setattr(db_product, field, value)
    db.commit()
    db.refresh(db_product)
    return db_product


def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    db.delete(db_product)
    db.commit()
    return None
