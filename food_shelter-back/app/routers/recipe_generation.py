# from fastapi import APIRouter, HTTPException
# from app.schemas.recipe_generation import GenerationRequest, GenerationResponse
# from app.services.recipe_generation import generate_recipe_samba

# router = APIRouter(prefix="/recipes/generate", tags=["recipe-generation"])


# @router.post("", response_model=GenerationResponse)
# async def generate(req: GenerationRequest):
#     text = generate_recipe_samba(req.ingredients, req.meal_type, req.servings)
#     # Парсинг результата
#     parts = [p.strip() for p in text.split("\n\n") if p.strip()]
#     if len(parts) >= 3:
#         title = parts[0]
#         ingredients_list = [line.strip()
#                             for line in parts[1].split("\n") if line.strip()]
#         instructions = []
#         for block in parts[2:]:
#             instructions.extend([line.strip()
#                                 for line in block.split("\n") if line.strip()])
#     else:
#         title = parts[0] if parts else ""
#         ingredients_list = []
#         instructions = [text]
#     return GenerationResponse(
#         title=title,
#         ingredients=ingredients_list,
#         instructions=instructions
#     )
