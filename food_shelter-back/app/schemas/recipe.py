from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from .recipe_ingredient import RecipeIngredient, RecipeIngredientBase


class RecipeBase(BaseModel):
    title: str
    meal_type: Optional[str] = None
    prep_time: Optional[int] = None
    servings: Optional[int] = None
    ingredient_strings: List[str] = Field(default_factory=list)
    instructions: List[str] = Field(default_factory=list)
    note: str = ""
    liked: bool = False


class RecipeCreate(RecipeBase):
    user_id: int
    ingredients: List[RecipeIngredientBase] = Field(default_factory=list)
    is_generated: bool = False


class Recipe(RecipeBase):
    id: int
    user_id: int
    is_generated: bool
    created_at: datetime
    ingredients: List[RecipeIngredient] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
