from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.user import User as UserModel
from app.schemas.user import UserCreate


def get_users(db: Session, skip: int = 0, limit: int = 100):
    """
    Получить список всех пользователей с пагинацией
    """
    return db.query(UserModel).offset(skip).limit(limit).all()


def get_user(db: Session, user_id: int):
    """
    Получить пользователя по ID
    """
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def create_user(db: Session, user_in: UserCreate):
    """
    Создать нового пользователя
    """
    # Проверяем уникальность email
    existing = db.query(UserModel).filter(
        UserModel.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    # TODO: хранить хэш пароля вместо открытого текста
    new_user = UserModel(
        email=user_in.email,
        password_hash=user_in.password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def update_user(db: Session, user_id: int, user_in: UserCreate):
    """
    Обновить email или пароль пользователя
    """
    user = get_user(db, user_id)
    user.email = user_in.email
    user.password_hash = user_in.password
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int):
    """
    Удалить пользователя
    """
    user = get_user(db, user_id)
    db.delete(user)
    db.commit()
    return None
