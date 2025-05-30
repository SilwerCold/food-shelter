from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List
from app.schemas.shopping_list_item import ShoppingListItem


class ShoppingListBase(BaseModel):
    name: str


class ShoppingListCreate(ShoppingListBase):
    user_id: int


class ShoppingList(ShoppingListBase):
    id: int
    user_id: int
    created_at: datetime
    items: List[ShoppingListItem] = []

    model_config = ConfigDict(from_attributes=True)
