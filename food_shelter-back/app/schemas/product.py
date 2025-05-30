from pydantic import BaseModel, ConfigDict
from typing import Optional


class ProductBase(BaseModel):
    name: str
    category: Optional[str] = None
    unit_type: str


class ProductCreate(ProductBase):
    pass


class Product(ProductBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
