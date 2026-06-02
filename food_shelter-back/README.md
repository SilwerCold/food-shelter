# RecipeBox Backend

FastAPI backend for RecipeBox.

## Local setup

1. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

2. Fill in `OPENROUTER_API_KEY`. By default the app uses the free OpenRouter model `qwen/qwen3-next-80b-a3b-instruct:free`.

3. Install Python dependencies:

   ```bash
   python -m pip install -r requirements.txt
   ```

4. Start PostgreSQL:

   ```bash
   docker compose up -d db
   ```

5. Run the API:

   ```bash
   uvicorn main:app --reload
   ```

## Docker setup

With `.env` configured, run both database and API:

```bash
docker compose up --build
```

The API will be available at `http://localhost:8000`.

## Updating an existing database

If your local PostgreSQL volume was created before generated recipe metadata was added, run:

```bash
psql "$DATABASE_URL" -f migrations/001_add_generated_recipe_fields.sql
```

For the default Docker database you can run:

```bash
docker compose exec -T db psql -U recipebox -d recipebox < migrations/001_add_generated_recipe_fields.sql
```

## OpenRouter recipe generation

`POST /recipes/generate` sends up to 5 selected user product IDs to OpenRouter Chat Completions API and expects a compact JSON recipe response:

```json
{
  "user_id": 1,
  "product_ids": [1, 2, 3],
  "meal_type": "breakfast",
  "servings": 2
}
```

Generation is rejected if `product_ids` is empty, contains duplicates, or contains more than 5 products.
