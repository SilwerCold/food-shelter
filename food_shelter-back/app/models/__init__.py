# app/models/__init__.py
# Импортируем модули «join-таблиц» раньше, чем Product
from .user_product import UserProduct
from .shopping_list_item import ShoppingListItem
from .recipe_ingredient import RecipeIngredient

# А затем — сами бизнес-модели
from .product import Product
from .user import User
from .shopping_list import ShoppingList
from .recipe import Recipe
