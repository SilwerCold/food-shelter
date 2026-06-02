from typing import List

from pydantic import BaseModel, Field, model_validator


MAX_GENERATION_PRODUCTS = 5
MAX_RECIPE_INGREDIENTS = 12
MAX_RECIPE_STEPS = 10


class GenerationRequest(BaseModel):
    product_ids: List[int] = Field(..., min_length=1, max_length=MAX_GENERATION_PRODUCTS)
    user_id: int = Field(ge=1)
    meal_type: str = "обед"
    servings: int = Field(default=2, ge=1, le=20)

    @model_validator(mode="after")
    def reject_duplicate_products(self):
        if any(product_id <= 0 for product_id in self.product_ids):
            raise ValueError("ID продуктов должны быть положительными")
        if len(set(self.product_ids)) != len(self.product_ids):
            raise ValueError("Продукты не должны повторяться")
        return self


class GenerationResponse(BaseModel):
    title: str = Field(max_length=120)
    ingredients: List[str] = Field(min_length=1, max_length=MAX_RECIPE_INGREDIENTS)
    instructions: List[str] = Field(min_length=1, max_length=MAX_RECIPE_STEPS)
    prep_time: int | None = Field(default=None, ge=1, le=240)
    servings: int = Field(ge=1, le=20)
