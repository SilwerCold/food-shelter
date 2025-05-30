from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session

import app.crud.user as crud
from app.schemas.user import User, UserCreate
from app.core.database import get_db

router = APIRouter(
    tags=["users"]
)


@router.get("/", response_model=List[User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Получить список пользователей
    """
    return crud.get_users(db, skip=skip, limit=limit)


@router.post("/", response_model=User)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Создать нового пользователя
    """
    return crud.create_user(db, user_in)


@router.get("/{user_id}", response_model=User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    """
    Получить пользователя по ID
    """
    return crud.get_user(db, user_id)


@router.put("/{user_id}", response_model=User)
def update_user(user_id: int, user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Обновить пользователя
    """
    return crud.update_user(db, user_id, user_in)


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """
    Удалить пользователя
    """
    crud.delete_user(db, user_id)
    return None
