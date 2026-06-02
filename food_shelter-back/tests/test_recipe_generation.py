import os

import pytest
from fastapi import HTTPException

os.environ.setdefault("POSTGRES_USER", "recipebox")
os.environ.setdefault("POSTGRES_PASSWORD", "recipeboxpass")
os.environ.setdefault("POSTGRES_DB", "recipebox")

from app.core.config import settings
from app.schemas.recipe_generation import GenerationRequest
from app.services.recipe_generation import generate_recipe_openrouter


class FakeResponse:
    def __init__(self, status_code=200, content=""):
        self.status_code = status_code
        self._content = content

    def json(self):
        return {
            "choices": [
                {
                    "message": {
                        "content": self._content,
                    }
                }
            ]
        }


class FakeClient:
    def __init__(self, response):
        self.response = response
        self.request = None

    async def post(self, url, headers=None, json=None):
        self.request = {"url": url, "headers": headers, "json": json}
        return self.response


@pytest.mark.asyncio
async def test_generate_recipe_openrouter_parses_valid_json(monkeypatch):
    monkeypatch.setattr(settings, "OPENROUTER_API_KEY", "test-key")
    monkeypatch.setattr(settings, "OPENROUTER_MODEL", "test/model")
    response = FakeResponse(
        content=(
            '{"title":"Омлет","ingredients":["Яйца — 2 шт."],'
            '"instructions":["Взбейте яйца","Обжарьте до готовности"],'
            '"prep_time":10,"servings":2}'
        )
    )
    client = FakeClient(response)

    recipe = await generate_recipe_openrouter(
        ingredients=["Яйца — 2 шт."],
        meal_type="breakfast",
        servings=2,
        client=client,
    )

    assert recipe.title == "Омлет"
    assert recipe.ingredients == ["Яйца — 2 шт."]
    assert recipe.instructions == ["Взбейте яйца", "Обжарьте до готовности"]
    assert recipe.prep_time == 10
    assert recipe.servings == 2
    assert client.request["json"]["model"] == "test/model"
    assert client.request["headers"]["Authorization"] == "Bearer test-key"


@pytest.mark.asyncio
async def test_generate_recipe_openrouter_requires_api_key(monkeypatch):
    monkeypatch.setattr(settings, "OPENROUTER_API_KEY", None)

    with pytest.raises(HTTPException) as exc_info:
        await generate_recipe_openrouter(ingredients=["Молоко"], client=FakeClient(FakeResponse()))

    assert exc_info.value.status_code == 500
    assert "OPENROUTER_API_KEY" in exc_info.value.detail


@pytest.mark.asyncio
async def test_generate_recipe_openrouter_maps_rate_limit(monkeypatch):
    monkeypatch.setattr(settings, "OPENROUTER_API_KEY", "test-key")

    with pytest.raises(HTTPException) as exc_info:
        await generate_recipe_openrouter(
            ingredients=["Молоко"],
            client=FakeClient(FakeResponse(status_code=429)),
        )

    assert exc_info.value.status_code == 429


def test_generation_request_requires_product_ids():
    with pytest.raises(ValueError):
        GenerationRequest(user_id=1, product_ids=[])


def test_generation_request_rejects_more_than_five_products():
    with pytest.raises(ValueError):
        GenerationRequest(user_id=1, product_ids=[1, 2, 3, 4, 5, 6])


def test_generation_request_rejects_duplicate_products():
    with pytest.raises(ValueError):
        GenerationRequest(user_id=1, product_ids=[1, 1])
