from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.product import Product as ProductModel
from app.models.user_product import UserProduct as UserProductModel
from app.schemas.recipe_generation import GenerationRequest, GenerationResponse
from app.services.recipe_generation import generate_recipe_openrouter

router = APIRouter(tags=["recipe-generation"])


def _get_product_ingredients(db: Session, req: GenerationRequest) -> list[str]:
    rows = db.query(ProductModel, UserProductModel).join(
        UserProductModel,
        UserProductModel.product_id == ProductModel.id,
    ).filter(
        UserProductModel.user_id == req.user_id,
        ProductModel.id.in_(req.product_ids),
    ).all()

    products_by_id = {}
    for product, user_product in rows:
        products_by_id[product.id] = (
            f"{product.name} — {user_product.quantity:g} {product.unit_type}"
        )

    missing_ids = set(req.product_ids) - set(products_by_id)
    if missing_ids:
        raise HTTPException(
            status_code=404,
            detail=(
                "Продукты не найдены у пользователя: "
                f"{', '.join(map(str, sorted(missing_ids)))}"
            ),
        )

    return [products_by_id[product_id] for product_id in req.product_ids]


@router.post("", response_model=GenerationResponse)
async def generate(req: GenerationRequest, db: Session = Depends(get_db)):
    ingredients = _get_product_ingredients(db, req)
    return await generate_recipe_openrouter(
        ingredients=ingredients,
        meal_type=req.meal_type,
        servings=req.servings,
    )
