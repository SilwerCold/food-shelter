import React from "react";
import { API_URL, USER_ID } from "../config";
import theme from "../theme";

const MAX_SELECTED_PRODUCTS = 5;

const MEAL_TYPES = [
  { value: "breakfast", label: "Завтрак" },
  { value: "lunch", label: "Обед" },
  { value: "dinner", label: "Ужин" },
  { value: "snack", label: "Перекус" },
];

export default function RecipeGenerator() {
  const [userProducts, setUserProducts] = React.useState([]);
  const [selectedProducts, setSelectedProducts] = React.useState([]);
  const [mealType, setMealType] = React.useState("breakfast");
  const [servings, setServings] = React.useState(2);
  const [loadingProducts, setLoadingProducts] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [recipe, setRecipe] = React.useState(null);
  const [error, setError] = React.useState("");
  const [saveMessage, setSaveMessage] = React.useState("");

  React.useEffect(() => {
    setLoadingProducts(true);
    setError("");

    Promise.all([
      fetch(`${API_URL}/user-products/`).then((res) => {
        if (!res.ok) throw new Error("Не удалось загрузить продукты пользователя");
        return res.json();
      }),
      fetch(`${API_URL}/products/`).then((res) => {
        if (!res.ok) throw new Error("Не удалось загрузить справочник продуктов");
        return res.json();
      }),
    ])
      .then(([userProductRows, productRows]) => {
        const productById = new Map(productRows.map((product) => [product.id, product]));
        const enrichedProducts = userProductRows
          .filter((row) => row.user_id === USER_ID)
          .map((row) => {
            const product = productById.get(row.product_id) || {};
            return {
              ...row,
              id: row.product_id,
              name: product.name || `Продукт #${row.product_id}`,
              category: product.category || "",
              unit_type: product.unit_type || "",
            };
          });
        setUserProducts(enrichedProducts);
      })
      .catch((err) => setError(err.message || "Ошибка загрузки продуктов"))
      .finally(() => setLoadingProducts(false));
  }, []);

  const toggleProduct = (productId) => {
    setSelectedProducts((current) => {
      if (current.includes(productId)) {
        setError("");
        return current.filter((id) => id !== productId);
      }

      if (current.length >= MAX_SELECTED_PRODUCTS) {
        setError(`Можно выбрать не больше ${MAX_SELECTED_PRODUCTS} продуктов`);
        return current;
      }

      setError("");
      return [...current, productId];
    });
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    if (selectedProducts.length === 0) return;

    setLoading(true);
    setError("");
    setSaveMessage("");
    setRecipe(null);

    fetch(`${API_URL}/recipes/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: USER_ID,
        product_ids: selectedProducts,
        meal_type: mealType,
        servings: Number(servings),
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.detail || "Не удалось сгенерировать рецепт");
        }
        return data;
      })
      .then((generatedRecipe) => setRecipe(generatedRecipe))
      .catch((err) => setError(err.message || "Ошибка генерации рецепта"))
      .finally(() => setLoading(false));
  };

  const handleSaveRecipe = () => {
    if (!recipe) return;

    setSaving(true);
    setError("");
    setSaveMessage("");

    fetch(`${API_URL}/recipes/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: USER_ID,
        title: recipe.title,
        meal_type: mealType,
        prep_time: recipe.prep_time || null,
        servings: recipe.servings || Number(servings),
        ingredient_strings: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        ingredients: [],
        is_generated: true,
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.detail || "Не удалось сохранить рецепт");
        }
        return data;
      })
      .then(() => setSaveMessage("Рецепт сохранён"))
      .catch((err) => setError(err.message || "Ошибка сохранения рецепта"))
      .finally(() => setSaving(false));
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

      {error && (
        <div
          style={{
            background: "rgba(208,135,112,0.14)",
            color: theme.accentOrange,
            border: `1px solid ${theme.accentOrange}`,
            borderRadius: "12px",
            padding: "14px 18px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

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
          {loadingProducts ? (
            <div style={{ color: theme.secondaryText }}>Загружаем продукты...</div>
          ) : userProducts.length === 0 ? (
            <div style={{ color: theme.secondaryText }}>
              У вас пока нет продуктов. Добавьте их на странице My Products.
            </div>
          ) : (
            <>
              <div style={{ color: theme.secondaryText, marginBottom: 10 }}>
                Можно выбрать до {MAX_SELECTED_PRODUCTS} продуктов.
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
                    onChange={() => toggleProduct(product.id)}
                    style={{ display: "none" }}
                  />
                  {product.name}
                  {product.quantity ? ` — ${product.quantity} ${product.unit_type}` : ""}
                </label>
              ))}
              </div>
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 24 }}>
          <div>
            <div
              style={{
                color: theme.accentBlue,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              2. Тип приема пищи:
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
              {MEAL_TYPES.map((mt) => (
                <option key={mt.value} value={mt.value}>
                  {mt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div
              style={{
                color: theme.accentBlue,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              3. Количество порций:
            </div>
            <input
              type="number"
              min="1"
              max="20"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              style={{
                width: 100,
                padding: "10px",
                borderRadius: "7px",
                border: `1.5px solid ${theme.card}`,
                background: theme.sidebar,
                color: theme.primaryText,
                fontSize: "1.05rem",
                outline: "none",
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={selectedProducts.length === 0 || loading || loadingProducts}
          style={{
            background: theme.accentBlue,
            color: theme.background,
            border: "none",
            borderRadius: "12px",
            padding: "14px 32px",
            fontSize: "1.14rem",
            fontWeight: 600,
            cursor:
              selectedProducts.length === 0 || loading || loadingProducts
                ? "not-allowed"
                : "pointer",
            opacity: selectedProducts.length === 0 || loading || loadingProducts ? 0.7 : 1,
            boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
            marginTop: "10px",
            transition: "0.2s",
          }}
        >
          {loading ? "Генерируем..." : "Сгенерировать рецепт"}
        </button>
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
              {recipe.instructions.map((step, i) => (
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

          <div
            style={{
              color: theme.accentBlue,
              fontSize: "1.02rem",
              marginTop: 16,
            }}
          >
            ⏱️ {recipe.prep_time || "—"} мин. &nbsp;|&nbsp; 🍽️ {recipe.servings} порций
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={handleSaveRecipe}
            style={{
              background: theme.accentGreen,
              color: theme.background,
              border: "none",
              borderRadius: "12px",
              padding: "12px 24px",
              fontSize: "1.04rem",
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
              marginTop: 24,
            }}
          >
            {saving ? "Сохраняем..." : "Сохранить рецепт"}
          </button>
          {saveMessage && (
            <span style={{ color: theme.accentGreen, marginLeft: 16 }}>{saveMessage}</span>
          )}
        </div>
      )}
    </div>
  );
}
