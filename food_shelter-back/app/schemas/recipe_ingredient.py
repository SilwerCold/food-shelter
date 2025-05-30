from pydantic import BaseModel, ConfigDict


class RecipeIngredientBase(BaseModel):
    product_id: int
    quantity: float
    is_required: bool = True


class RecipeIngredient(RecipeIngredientBase):
    recipe_id: int

    model_config = ConfigDict(from_attributes=True)
