import React from "react";
import theme from "../theme";
import { API_URL } from "../config";

// Моковые продукты пользователя для примера
const MOCK_PRODUCTS = [
  { id: 1, name: "Молоко" },
  { id: 2, name: "Яйца" },
  { id: 3, name: "Мука" },
  { id: 4, name: "Сахар" },
];

export default function RecipeGenerator() {
  const [userProducts] = React.useState(MOCK_PRODUCTS);

  // Храним массив выбранных id продуктов
  const [selectedProducts, setSelectedProducts] = React.useState([]);
  const [mealType, setMealType] = React.useState("breakfast");
  const [loading, setLoading] = React.useState(false);

  // recipe теперь ожидает объект вида:
  // {
  //   title: string,
  //   ingredients: string[],
  //   directions: string[],
  //   prep_time?: number,
  //   servings?: number
  // }
  const [recipe, setRecipe] = React.useState(null);
  const [error, setError] = React.useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (selectedProducts.length === 0) return;
    setLoading(true);
    setError(null);

    // Из выбранных id собираем массив названий
    const namesRu = selectedProducts.map((id) => {
      const prod = userProducts.find((p) => p.id === id);
      return prod ? prod.name : "";
    });

    try {
      const response = await fetch(`${API_URL}/recipes/generate/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients_ru: namesRu, meal_type: mealType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Не удалось получить рецепт с сервера"
        );
      }

      const data = await response.json();
      // Ожидаем, что сервер вернул JSON:
      // { title: string, ingredients: string[], directions: string[], prep_time?: number, servings?: number }
      setRecipe({
        title: data.title,
        ingredients: data.ingredients,
        directions: data.directions,
        prep_time: data.prep_time,
        servings: data.servings,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "48px 40px 0 40px" }}>
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: "600",
          marginBottom: "36px",
          color: theme.primaryText,
        }}
      >
        Recipe Generator
      </h1>

      <form
        onSubmit={handleGenerate}
        style={{
          background: theme.card,
          borderRadius: "18px",
          padding: "32px",
          marginBottom: "36px",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              color: theme.accentBlue,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            1. Выберите продукты:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {userProducts.map((product) => (
              <label
                key={product.id}
                style={{
                  background: selectedProducts.includes(product.id)
                    ? theme.accentGreen
                    : theme.sidebar,
                  color: selectedProducts.includes(product.id)
                    ? theme.background
                    : theme.primaryText,
                  padding: "8px 16px",
                  borderRadius: "7px",
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "0.2s",
                  border: `1.5px solid ${theme.card}`,
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => {
                    setSelectedProducts(
                      selectedProducts.includes(product.id)
                        ? selectedProducts.filter((id) => id !== product.id)
                        : [...selectedProducts, product.id]
                    );
                  }}
                  style={{ display: "none" }}
                />
                {product.name}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              color: theme.accentBlue,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            2. Тип приёма пищи:
          </div>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "7px",
              border: `1.5px solid ${theme.card}`,
              background: theme.sidebar,
              color: theme.primaryText,
              fontSize: "1.05rem",
              outline: "none",
            }}
          >
            <option value="breakfast">Завтрак</option>
            <option value="lunch">Обед</option>
            <option value="dinner">Ужин</option>
            <option value="snack">Перекус</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={selectedProducts.length === 0 || loading}
          style={{
            background: theme.accentBlue,
            color: theme.background,
            border: "none",
            borderRadius: "12px",
            padding: "14px 32px",
            fontSize: "1.14rem",
            fontWeight: 600,
            cursor:
              selectedProducts.length === 0 || loading
                ? "not-allowed"
                : "pointer",
            opacity: selectedProducts.length === 0 || loading ? 0.7 : 1,
            boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
            marginTop: "10px",
            transition: "0.2s",
          }}
        >
          {loading ? "Генерируем..." : "Сгенерировать рецепт"}
        </button>

        {error && (
          <div style={{ marginTop: 12, color: "red", fontWeight: 500 }}>
            Ошибка: {error}
          </div>
        )}
      </form>

      {recipe && (
        <div
          style={{
            background: theme.card,
            borderRadius: "20px",
            padding: "36px 44px",
            margin: "0 auto",
            maxWidth: 600,
            boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
            marginBottom: 64,
            marginTop: 18,
            border: `2px solid ${theme.accentGreen}`,
            transition: "box-shadow 0.2s",
          }}
        >
          <h2
            style={{
              color: theme.accentGreen,
              marginTop: 0,
              marginBottom: 22,
              fontSize: "2rem",
              letterSpacing: "1.5px",
            }}
          >
            {recipe.title}
          </h2>

          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: "1.1rem",
                color: theme.accentBlue,
                marginBottom: 5,
                letterSpacing: "1px",
              }}
            >
              🥣 Ингредиенты:
            </div>
            <ul style={{ paddingLeft: 24, marginTop: 6 }}>
              {recipe.ingredients.map((ing, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: "1.03rem",
                    color: theme.primaryText,
                    marginBottom: 3,
                  }}
                >
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: "1.08rem",
                color: theme.accentBlue,
                marginBottom: 4,
                letterSpacing: "1px",
              }}
            >
              👨‍🍳 Инструкция:
            </div>
            <ol style={{ marginTop: 5, marginBottom: 0, paddingLeft: 22 }}>
              {recipe.directions.map((step, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: "1.04rem",
                    color: theme.secondaryText,
                    marginBottom: 5,
                  }}
                >
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Эти поля будут показаны, только если они есть в объекте recipe */}
          {(recipe.prep_time || recipe.servings) && (
            <div
              style={{
                color: theme.accentPurple,
                fontWeight: 500,
                fontSize: "1.03rem",
                marginTop: 10,
              }}
            >
              {recipe.prep_time && (
                <>
                  ⏱️ Время: <b>{recipe.prep_time} мин.</b>{" "}
                </>
              )}
              {recipe.servings && (
                <>
                  &nbsp;|&nbsp; 🍽️ Порций: <b>{recipe.servings}</b>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
