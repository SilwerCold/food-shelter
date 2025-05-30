from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base


class Product(Base):
    __tablename__ = 'products'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=True)
    unit_type = Column(String, nullable=False)

    user_products = relationship("UserProduct", back_populates="product")
    recipe_ingredients = relationship(
        "RecipeIngredient", back_populates="product")
    shopping_list_items = relationship(
        "ShoppingListItem", back_populates="product")
