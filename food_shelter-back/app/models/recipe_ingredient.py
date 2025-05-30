from sqlalchemy import Column, Integer, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class RecipeIngredient(Base):
    __tablename__ = 'recipe_ingredients'
    recipe_id = Column(Integer, ForeignKey('recipes.id'), primary_key=True)
    product_id = Column(Integer, ForeignKey('products.id'), primary_key=True)
    quantity = Column(Float, nullable=False)
    is_required = Column(Boolean, default=True)

    recipe = relationship("Recipe", back_populates="ingredients")
    product = relationship("Product", back_populates="recipe_ingredients")
