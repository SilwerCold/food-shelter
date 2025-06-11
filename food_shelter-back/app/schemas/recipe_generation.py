from pydantic import BaseModel
from typing import List


class GenerateRequest(BaseModel):
    ingredients_ru: List[str]


class GenerateResponse(BaseModel):
    title: str
    ingredients: List[str]
    directions: List[str]
