# from app.schemas.recipe_generation import GenerationRequest, GenerationResponse
# from fastapi import APIRouter, HTTPException
# from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
# from typing import List

# # Модель SambaLingo-Russian-Chat, instruction-tuned
# _MODEL_NAME = "sambanovasystems/SambaLingo-Russian-Chat"
# # Используем slow tokenizer, чтобы избежать ошибок конвертации
# _tokenizer = AutoTokenizer.from_pretrained(
#     _MODEL_NAME,
#     use_fast=False
# )
# _model = AutoModelForCausalLM.from_pretrained(
#     _MODEL_NAME,
#     trust_remote_code=True
# )

# # Создаём пайплайн для генерации текста
# _chat = pipeline(
#     "text-generation",
#     model=_model,
#     tokenizer=_tokenizer,
#     device=-1,            # CPU; для GPU укажите device=0
#     max_length=512,
#     do_sample=True,
#     temperature=0.7,
#     top_p=0.9,
# )


# def generate_recipe_samba(
#     ingredients: List[str],
#     meal_type: str = "обед",
#     servings: int = 2,
# ) -> str:
#     """
#     Генерирует рецепт на русском языке через SambaLingo с использованием токенов инструкций.
#     """
#     # Преобразование данных из сервиса в формат инструкций модели
#     system_prompt = (
#         "Ты — генератор рецептов на русском языке. "
#         "На вход даются продукты, тип приёма пищи и число порций. "
#         "Твоя задача — выдать название рецепта, список ингредиентов и пошаговую инструкцию."
#     )
#     user_prompt = (
#         f"Продукты: {', '.join(ingredients)}; "
#         f"Тип приёма пищи: {meal_type}; Порций: {servings}. "
#         "Сгенерируй рецепт."
#     )
#     # Формируем полный промпт в стиле [INST] для SambaLingo
#     full_prompt = (
#         "<s>[INST]\n"
#         "<<SYS>>\n" + system_prompt + "\n<</SYS>>\n"
#         + user_prompt + "[/INST]"
#     )
#     # Генерация ответа
#     outputs = _chat(full_prompt)
#     # Возвращаем сгенерированный текст
#     return outputs[0]['generated_text'].strip()
