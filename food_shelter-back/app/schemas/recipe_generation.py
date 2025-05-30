from pydantic import BaseModel
from typing import List


class GenerationRequest(BaseModel):
    ingredients: List[str]
    meal_type: str = "обед"
    servings: int = 2


class GenerationResponse(BaseModel):
    title: str
    ingredients: List[str]
    instructions: List[str]
