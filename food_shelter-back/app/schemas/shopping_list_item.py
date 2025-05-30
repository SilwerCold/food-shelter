from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ShoppingListItemBase(BaseModel):
    product_id: int
    quantity: float
    is_bought: bool = False


class ShoppingListItemCreate(ShoppingListItemBase):
    list_id: int


class ShoppingListItem(ShoppingListItemBase):
    list_id: int
    added_at: datetime

    model_config = ConfigDict(from_attributes=True)
