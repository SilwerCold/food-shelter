from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class UserProductBase(BaseModel):
    product_id: int
    quantity: float
    expiry_date: Optional[datetime] = None


class UserProductCreate(UserProductBase):
    user_id: int


class UserProduct(UserProductBase):
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
