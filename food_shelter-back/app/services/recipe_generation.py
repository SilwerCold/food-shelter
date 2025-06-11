from transformers import (
    T5ForConditionalGeneration,
    T5Tokenizer,
    AutoTokenizer,
    AutoModelForSeq2SeqLM
)
import threading
import torch
from typing import Dict

# ============================================
# 1) Определяем имена моделей и глобальные переменные
# ============================================

# 1.1. Модель перевода (utrobinmv/t5_translate_en_ru_zh_base_200)
TRANSLATE_MODEL_NAME = "facebook/nllb-200-distilled-600M"
trans_tokenizer: AutoTokenizer | None = None
trans_model: AutoModelForSeq2SeqLM | None = None

# 1.2. Модель генерации рецептов (PyTorch-T5)
RECIPE_MODEL_NAME = "flax-community/t5-recipe-generation"
recipe_tokenizer: AutoTokenizer | None = None
recipe_model: T5ForConditionalGeneration | None = None

# Блокировка, чтобы убедиться, что инициализация моделей поточно-безопасна
model_lock = threading.Lock()


async def load_models():
    """
    Загружаем обе модели единожды при старте приложения.
    """
    global trans_tokenizer, trans_model, recipe_tokenizer, recipe_model

    with model_lock:
        # ========================================================
        # 1) Загрузка модели перевода Meta NLLB-200 (distilled-600M)
        # ========================================================
        if trans_tokenizer is None or trans_model is None:
            # Указываем src_lang и tgt_lang, чтобы токенизатор сразу «знал» языки
            trans_tokenizer = AutoTokenizer.from_pretrained(
                TRANSLATE_MODEL_NAME,
                src_lang="eng_Latn",   # английский
                tgt_lang="rus_Cyrl"    # русский
            )
            trans_model = AutoModelForSeq2SeqLM.from_pretrained(
                TRANSLATE_MODEL_NAME)
            # Переносим на GPU (если есть)
            if torch.cuda.is_available():
                trans_model = trans_model.to("cuda")

        # ========================================================
        # 2) Загрузка модели генерации рецептов (PyTorch-T5)
        # ========================================================
        if recipe_tokenizer is None or recipe_model is None:
            recipe_tokenizer = AutoTokenizer.from_pretrained(RECIPE_MODEL_NAME)
            recipe_model = AutoModelForSeq2SeqLM.from_pretrained(
                RECIPE_MODEL_NAME)
            if torch.cuda.is_available():
                recipe_model = recipe_model.to("cuda")


def translate_en_to_ru(text: str) -> str:
    """
    Перевод с английского на русский через модель Meta NLLB-200 (distilled-600M).
    На вход — фрагмент рецепта на английском, возвращаем русский.
    """
    # 1) Токенизируем входной текст без каких-либо префиксов, т.к. NLLB ожидает plain text
    inputs = trans_tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding="longest"
    )

    # 2) Перемещаем все тензоры на тот же девайс, что и модель (CPU или GPU)
    device = next(trans_model.parameters()).device
    inputs = {k: v.to(device) for k, v in inputs.items()}

    # 3) Определяем ID языка-цели (русский).
    #    AutoTokenizer.get_lang_id("rus_Cyrl") возвращает нужный токен
    ru_token_id = trans_tokenizer.get_lang_id("rus_Cyrl")

    # 4) Генерируем перевод, «заставляя» модель начинать генерировать с русского BOS-токена
    generated_ids = trans_model.generate(
        **inputs,
        forced_bos_token_id=ru_token_id,
        max_length=512,
        num_beams=5,
        early_stopping=True
    )

    # 5) Декодируем и возвращаем единственную строку перевода
    translated = trans_tokenizer.batch_decode(
        generated_ids, skip_special_tokens=True)
    return translated[0]


def translate_list_ru_to_en(words: list[str]) -> str:
    """
    Переводим список русских слов (напр. ["Молоко","Яйца","Мука"]) одним запросом.
    Возвращаем строку "milk, eggs, flour".
    """
    # 1) Собираем все слова в одну строку через запятую
    joined = ", ".join(words)
    src_text = "translate to en: " + joined

    # 2) Токенизируем и перемещаем на устройство модели
    inputs = trans_tokenizer(
        src_text,
        return_tensors="pt",
        truncation=True,
        padding="longest"
    )
    device = next(trans_model.parameters()).device
    inputs = {k: v.to(device) for k, v in inputs.items()}

    # 3) Генерируем перевод одного «предложения»
    generated_ids = trans_model.generate(
        **inputs,
        max_length=64,
        num_beams=4,
        early_stopping=True
    )
    translated = trans_tokenizer.decode(
        generated_ids[0], skip_special_tokens=True)
    return translated.lower().strip()


def generate_recipe_en(ingredients_en: str) -> str:
    """
    Генерация рецепта на английском через PyTorch-T5.
    Вход — строка "milk, eggs, flour". Возвращаем текст с <sep> и <section>,
    которые заменим потом на более читабельные разделители.
    """
    prompt = f"items: {ingredients_en}"
    # Токенизируем в формате batch_size=1
    inputs = recipe_tokenizer(
        prompt,
        return_tensors="pt",
        truncation=True,
        padding="longest"
    )
    device = next(recipe_model.parameters()).device
    inputs = {k: v.to(device) for k, v in inputs.items()}

    # Генерируем рецепт
    output_ids = recipe_model.generate(
        **inputs,
        max_length=128,
        num_beams=4,
        no_repeat_ngram_size=2,
        repetition_penalty=2.0,
        early_stopping=True
    )

    # Декодируем и заменяем спецтокены
    raw = recipe_tokenizer.decode(output_ids[0], skip_special_tokens=True)
    return raw.replace("<sep>", "--").replace("<section>", "\n")


def parse_recipe(recipe_str: str) -> Dict[str, object]:
    """
    Парсит строку рецепта формата:
      "title: <заголовок> ingredients: <ингредиенты> directions: <инструкции>"
    и возвращает словарь:
      {
        "title": str,
        "ingredients": List[str],
        "directions": List[str]
      }

    При этом ingredients распознаются по шаблону:
      <количество> <юнит> <название ингредиента>
    а затем берутся все символы до следующего количества или конца строки.
    """
    import re
    # 1) Разбиваем на три части (title, ingredients, directions) через regex
    pattern = r'(?i)title:\s*(.*?)\s*ingredients:\s*(.*?)\s*directions:\s*(.*)'
    match = re.search(pattern, recipe_str, re.DOTALL)
    if not match:
        raise ValueError(
            "Неправильный формат рецепта. "
            "Ожидается: \"title: ... ingredients: ... directions: ...\""
        )

    title = match.group(1).strip()
    ingredients_block = match.group(2).strip()
    directions_block = match.group(3).strip()

    # 2) Разбираем ingredients_block по шаблону "количество + юнит + название"
    #    Шаблон для количества: \d+(?:[\/\.]\d+)?  (например, "1", "1/2", "2.5")
    #    Затем может идти пробел + произвольный юнит (буквы/цифры/точка): \s*\w*\.?
    #    И далее всё вплоть до следующего количества или конца: [^0-9]*?
    ing_pattern = re.compile(
        r'(\d+(?:[\/\.]\d+)?\s*\w*\.?[^0-9]*?)(?=(?:\d+(?:[\/\.]\d+)?\s*\w*\.?)|$)'
    )
    ingredients = [m.group(1).strip()
                   for m in ing_pattern.finditer(ingredients_block)]

    # 3) Разбираем directions_block на шаги: делим по точке (".") + пробел (или просто ".")
    raw_dirs = re.split(r'\.\s*', directions_block)
    # Обрезаем пробелы и конечные точки, фильтруем пустые
    directions = [step.strip().rstrip('.')
                  for step in raw_dirs if step.strip()]

    return {
        "title": title,
        "ingredients": ingredients,
        "directions": directions
    }


def translate_recipe_dict(recipe: Dict[str, object]) -> Dict[str, object]:
    """
    Переводит поля словаря recipe следующего вида:
        {
            "title": str,
            "ingredients": List[str],
            "directions": List[str]
        }
    с помощью функции translate_en_to_ru().
    Возвращает точно такой же словарь, но со значениями на русском.
    """
    translated: Dict[str, object] = {}
    for key, value in recipe.items():
        if isinstance(value, str):
            # title
            translated[key] = translate_en_to_ru(value)
        elif isinstance(value, list):
            # ingredients или directions
            translated[key] = [translate_en_to_ru(item) for item in value]
        else:
            # если вдруг другой тип, просто копируем
            translated[key] = value
    return translated
