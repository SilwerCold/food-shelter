from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.user_product import UserProduct as UserProductModel
from app.schemas.user_product import UserProductCreate
from app.models.user import User as UserModel
from app.models.product import Product as ProductModel


def get_user_products(db: Session, skip: int = 0, limit: int = 100):
    """
    Получить список всех продуктов пользователя с пагинацией
    """
    return db.query(UserProductModel).offset(skip).limit(limit).all()


def get_user_product(db: Session, user_id: int, product_id: int):
    """
    Получить конкретный продукт пользователя по composite ключу
    """
    obj = db.query(UserProductModel).filter(
        UserProductModel.user_id == user_id,
        UserProductModel.product_id == product_id
    ).first()
    if not obj:
        raise HTTPException(status_code=404, detail="UserProduct not found")
    return obj


def create_user_product(db: Session, item: UserProductCreate):
    """
    Добавить новый продукт в список пользователя
    """
    # Валидация существования пользователя и продукта
    if not db.query(UserModel).filter(UserModel.id == item.user_id).first():
        raise HTTPException(status_code=404, detail="User not found")
    if not db.query(ProductModel).filter(ProductModel.id == item.product_id).first():
        raise HTTPException(status_code=404, detail="Product not found")

    # Проверка дубликата
    existing = db.query(UserProductModel).filter(
        UserProductModel.user_id == item.user_id,
        UserProductModel.product_id == item.product_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=400, detail="UserProduct already exists")

    new_obj = UserProductModel(
        user_id=item.user_id,
        product_id=item.product_id,
        quantity=item.quantity,
        expiry_date=item.expiry_date
    )
    db.add(new_obj)
    db.commit()
    db.refresh(new_obj)
    return new_obj


def update_user_product(db: Session, user_id: int, product_id: int, item: UserProductCreate):
    """
    Обновить количество и/или срок годности продукта пользователя
    """
    obj = get_user_product(db, user_id, product_id)
    obj.quantity = item.quantity
    obj.expiry_date = item.expiry_date
    db.commit()
    db.refresh(obj)
    return obj


def delete_user_product(db: Session, user_id: int, product_id: int):
    """
    Удалить продукт из списка пользователя
    """
    obj = get_user_product(db, user_id, product_id)
    db.delete(obj)
    db.commit()
    return None
