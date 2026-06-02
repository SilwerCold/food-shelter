import json
import re
from typing import List, Optional

import httpx
from fastapi import HTTPException
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.recipe_generation import GenerationResponse


SYSTEM_PROMPT = """
Ты — русскоязычный кулинарный помощник RecipeBox. Генерируй практичные домашние рецепты.
Требования:
- отвечай только валидным JSON без markdown и без пояснений вокруг JSON;
- используй выбранные пользователем продукты как основу рецепта;
- допускай базовые продукты кухни, например воду, соль, перец, масло, специи;
- не предлагай опасные способы приготовления и явно прожаривай/проваривай рискованные продукты;
- рецепт должен быть компактным: максимум 12 ингредиентов и максимум 10 шагов;
- инструкции должны быть короткими, понятными и пошаговыми.
JSON-структура ответа строго такая:
{
  "title": "Название рецепта",
  "ingredients": ["Ингредиент — количество"],
  "instructions": ["Шаг 1", "Шаг 2"],
  "prep_time": 25,
  "servings": 2
}
""".strip()


def _build_headers() -> dict[str, str]:
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }
    if settings.OPENROUTER_SITE_URL:
        headers["HTTP-Referer"] = settings.OPENROUTER_SITE_URL
    if settings.OPENROUTER_APP_NAME:
        headers["X-Title"] = settings.OPENROUTER_APP_NAME
    return headers


def _extract_json(content: str) -> dict:
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", content, flags=re.DOTALL)
        if not match:
            raise HTTPException(
                status_code=502,
                detail="OpenRouter вернул ответ без JSON-рецепта",
            )
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError as exc:
            raise HTTPException(
                status_code=502,
                detail="OpenRouter вернул невалидный JSON-рецепт",
            ) from exc


def _normalise_response(payload: dict, requested_servings: int) -> GenerationResponse:
    if payload.get("servings") is None:
        payload["servings"] = requested_servings
    try:
        return GenerationResponse.model_validate(payload)
    except ValidationError as exc:
        raise HTTPException(
            status_code=502,
            detail="OpenRouter вернул рецепт в неподдерживаемом формате",
        ) from exc


def _build_user_prompt(ingredients: List[str], meal_type: str, servings: int) -> str:
    return (
        f"Продукты пользователя: {', '.join(ingredients)}. "
        f"Тип приёма пищи: {meal_type}. "
        f"Количество порций: {servings}. "
        "Сгенерируй один рецепт на русском языке и верни только JSON."
    )


async def generate_recipe_openrouter(
    ingredients: List[str],
    meal_type: str = "обед",
    servings: int = 2,
    client: Optional[httpx.AsyncClient] = None,
) -> GenerationResponse:
    """
    Генерирует рецепт через OpenRouter Chat Completions API.
    """
    if not settings.OPENROUTER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OPENROUTER_API_KEY не настроен на сервере",
        )
    if not ingredients:
        raise HTTPException(status_code=422, detail="Нужно выбрать хотя бы один продукт")

    request_payload = {
        "model": settings.OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": _build_user_prompt(ingredients, meal_type, servings)},
        ],
        "temperature": settings.OPENROUTER_TEMPERATURE,
        # Ограничивает длину ответа; 900 токенов достаточно для компактного JSON-рецепта.
        "max_tokens": settings.OPENROUTER_MAX_TOKENS,
        "response_format": {"type": "json_object"},
    }
    url = f"{settings.OPENROUTER_BASE_URL.rstrip('/')}/chat/completions"

    owns_client = client is None
    if client is None:
        client = httpx.AsyncClient(timeout=settings.OPENROUTER_TIMEOUT_SECONDS)

    try:
        response = await client.post(url, headers=_build_headers(), json=request_payload)
    except httpx.TimeoutException as exc:
        raise HTTPException(status_code=504, detail="OpenRouter не ответил вовремя") from exc
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Не удалось связаться с OpenRouter") from exc
    finally:
        if owns_client:
            await client.aclose()

    if response.status_code in {401, 403}:
        raise HTTPException(status_code=502, detail="Ошибка авторизации OpenRouter")
    if response.status_code == 429:
        raise HTTPException(status_code=429, detail="OpenRouter: превышен лимит запросов или баланса")
    if response.status_code >= 500:
        raise HTTPException(status_code=502, detail="OpenRouter временно недоступен")
    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail="OpenRouter вернул ошибку генерации")

    data = response.json()
    choices = data.get("choices") or []
    content = (
        choices[0]
        .get("message", {})
        .get("content", "")
        if choices else ""
    )
    if not content:
        raise HTTPException(status_code=502, detail="OpenRouter вернул пустой рецепт")

    recipe_payload = _extract_json(content)
    return _normalise_response(recipe_payload, servings)
