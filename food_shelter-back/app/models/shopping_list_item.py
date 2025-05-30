from sqlalchemy import Column, Integer, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime


class ShoppingListItem(Base):
    __tablename__ = 'shopping_list_items'
    list_id = Column(Integer, ForeignKey(
        'shopping_lists.id'), primary_key=True)
    product_id = Column(Integer, ForeignKey('products.id'), primary_key=True)
    quantity = Column(Float, nullable=False)
    is_bought = Column(Boolean, default=False)
    added_at = Column(DateTime, default=datetime.utcnow)

    shopping_list = relationship("ShoppingList", back_populates="items")
    product = relationship("Product", back_populates="shopping_list_items")
