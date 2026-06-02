from datetime import datetime

from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Recipe(Base):
    __tablename__ = 'recipes'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    title = Column(String, nullable=False)
    meal_type = Column(String, nullable=True)
    prep_time = Column(Integer, nullable=True)
    servings = Column(Integer, nullable=True)
    ingredient_strings = Column(JSON, default=list)
    instructions = Column(JSON, default=list)
    note = Column(String, default="")
    liked = Column(Boolean, default=False)
    is_generated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="recipes")
    ingredients = relationship("RecipeIngredient", back_populates="recipe")
