from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from .recipe_ingredient import RecipeIngredientBase, RecipeIngredient


class RecipeBase(BaseModel):
    title: str
    meal_type: Optional[str] = None
    prep_time: Optional[int] = None
    servings: Optional[int] = None


class RecipeCreate(RecipeBase):
    user_id: int
    ingredients: List[RecipeIngredientBase]


class Recipe(RecipeBase):
    id: int
    user_id: int
    is_generated: bool
    created_at: datetime
    ingredients: List[RecipeIngredient]

    model_config = ConfigDict(from_attributes=True)
