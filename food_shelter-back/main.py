from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from app.core.config import settings
from app.routers import product, user_product, shopping_list, shopping_list_item, recipe, recipe_ingredient, user#, recipe_generation

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for personal RecipeBox project",
    version=settings.VERSION
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # <--- разрешаем доступ с фронта!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(user.router, prefix="/users", tags=["users"])
app.include_router(product.router, prefix="/products", tags=["products"])
app.include_router(user_product.router,
                   prefix="/user-products", tags=["user-products"])
app.include_router(shopping_list.router,
                   prefix="/shopping-lists", tags=["shopping-lists"])
app.include_router(shopping_list_item.router,
                   prefix="/shopping-list-items", tags=["shopping-list-items"])
app.include_router(recipe.router, prefix="/recipes", tags=["recipes"])
app.include_router(recipe_ingredient.router,
                   prefix="/recipe-ingredients", tags=["recipe-ingredients"])
#app.include_router(recipe_generation.router,
#                   prefix="/recipes/generate", tags=["recipe-generation"])

@app.get("/")
async def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API v{settings.VERSION}"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST,
                port=settings.PORT, reload=True)
