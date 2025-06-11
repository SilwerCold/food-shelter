from fastapi import APIRouter, HTTPException
from app.schemas.recipe_generation import GenerateResponse, GenerateRequest
from app.services.recipe_generation import translate_en_to_ru, translate_list_ru_to_en, generate_recipe_en, parse_recipe, translate_recipe_dict


router = APIRouter(tags=["recipe-generation"])


@router.post("/", response_model=GenerateResponse)
async def generate_recipe_endpoint(request: GenerateRequest):
    if not request.ingredients_ru:
        raise HTTPException(400, "Список продуктов не может быть пустым.")

    # 1) Переводим весь список продуктов RU→EN
    try:
        ingredients_en = translate_list_ru_to_en(request.ingredients_ru)
        print(ingredients_en)
    except Exception as e:
        raise HTTPException(500, f"Ошибка перевода RU→EN: {str(e)}")

    # 2) Генерируем рецепт на английском
    try:
        recipe_en = generate_recipe_en(ingredients_en)
        print(recipe_en)
    except Exception as e:
        raise HTTPException(500, f"Ошибка генерации рецепта (EN): {str(e)}")

    try:
        recipe_en_dict = parse_recipe(recipe_en)
    except Exception as e:
        raise HTTPException(500, "Ошибка парсинга EN")
    
    try:
        recipe_ru_dict = translate_recipe_dict(recipe_en_dict)
        print(recipe_ru_dict)
    except Exception as e:
        raise HTTPException(500, "Ошибка перевода словаря")
    return recipe_ru_dict
