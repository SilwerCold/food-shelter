import React from "react";
import { API_URL, USER_ID } from "../config";
import theme from "../theme";

function getRecipeIngredients(recipe) {
  if (recipe.ingredient_strings && recipe.ingredient_strings.length > 0) {
    return recipe.ingredient_strings;
  }

  return (recipe.ingredients || []).map(
    (ingredient) => `Продукт #${ingredient.product_id} — ${ingredient.quantity}`
  );
}

export default function SavedRecipes() {
  const [recipes, setRecipes] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [editNote, setEditNote] = React.useState({ id: null, text: "" });

  React.useEffect(() => {
    setLoading(true);
    setError("");

    fetch(`${API_URL}/recipes/?user_id=${USER_ID}`)
      .then(async (res) => {
        const data = await res.json().catch(() => []);
        if (!res.ok) {
          throw new Error(data.detail || "Не удалось загрузить рецепты");
        }
        return data;
      })
      .then((loadedRecipes) => setRecipes(loadedRecipes))
      .catch((err) => setError(err.message || "Ошибка загрузки рецептов"))
      .finally(() => setLoading(false));
  }, []);

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(search.toLowerCase())
  );

  const persistRecipe = (recipe) => {
    fetch(`${API_URL}/recipes/${recipe.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: recipe.user_id,
        title: recipe.title,
        meal_type: recipe.meal_type,
        prep_time: recipe.prep_time,
        servings: recipe.servings,
        ingredient_strings: recipe.ingredient_strings || [],
        instructions: recipe.instructions || [],
        note: recipe.note || "",
        liked: Boolean(recipe.liked),
        is_generated: Boolean(recipe.is_generated),
        ingredients: recipe.ingredients || [],
      }),
    }).catch(() => setError("Не удалось сохранить изменения рецепта"));
  };

  const handleDelete = (id) => {
    fetch(`${API_URL}/recipes/${id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Не удалось удалить рецепт");
        setRecipes((current) => current.filter((recipe) => recipe.id !== id));
      })
      .catch((err) => setError(err.message || "Ошибка удаления рецепта"));
  };

  const handleLike = (id) => {
    setRecipes((current) =>
      current.map((recipe) => {
        if (recipe.id !== id) return recipe;
        const updatedRecipe = { ...recipe, liked: !recipe.liked };
        persistRecipe(updatedRecipe);
        return updatedRecipe;
      })
    );
  };

  const handleSaveNote = (id) => {
    setRecipes((current) =>
      current.map((recipe) => {
        if (recipe.id !== id) return recipe;
        const updatedRecipe = { ...recipe, note: editNote.text };
        persistRecipe(updatedRecipe);
        return updatedRecipe;
      })
    );
    setEditNote({ id: null, text: "" });
  };

  return (
    <div style={{ padding: "48px 40px 0 40px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "600",
            color: theme.primaryText,
          }}
        >
          Saved Recipes
        </h1>
        <input
          placeholder="Поиск по названию..."
          style={{
            background: theme.sidebar,
            color: theme.primaryText,
            border: `1.5px solid ${theme.card}`,
            borderRadius: "7px",
            padding: "9px 16px",
            fontSize: "1.04rem",
            minWidth: 220,
          }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

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

      {loading ? (
        <div
          style={{
            background: theme.card,
            borderRadius: "18px",
            minHeight: "200px",
            padding: "32px",
            color: theme.secondaryText,
          }}
        >
          Загружаем рецепты...
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div
          style={{
            background: theme.card,
            borderRadius: "18px",
            minHeight: "200px",
            padding: "32px",
            color: theme.secondaryText,
          }}
        >
          Нет сохранённых рецептов.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "36px",
          }}
        >
          {filteredRecipes.map((recipe) => {
            const ingredients = getRecipeIngredients(recipe);
            return (
              <div
                key={recipe.id}
                style={{
                  background: theme.card,
                  borderRadius: "18px",
                  padding: "28px 26px 22px 26px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  position: "relative",
                  minHeight: 330,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h2
                      style={{
                        color: theme.accentGreen,
                        fontSize: "1.35rem",
                        margin: 0,
                      }}
                    >
                      {recipe.title}
                    </h2>
                    <span
                      style={{
                        fontSize: "1.35rem",
                        color: recipe.liked ? theme.accentPurple : theme.secondaryText,
                        cursor: "pointer",
                        marginLeft: 8,
                      }}
                      onClick={() => handleLike(recipe.id)}
                      title={recipe.liked ? "Убрать из любимых" : "Отметить как любимое"}
                    >
                      {recipe.liked ? "♥" : "♡"}
                    </span>
                  </div>
                  <button
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      background: "none",
                      border: "none",
                      color: theme.accentOrange,
                      fontSize: "1.15rem",
                      cursor: "pointer",
                      padding: 0,
                      lineHeight: 1,
                    }}
                    title="Удалить рецепт"
                    onClick={() => handleDelete(recipe.id)}
                  >
                    🗑️
                  </button>
                </div>

                <div
                  style={{
                    fontSize: "1.02rem",
                    color: theme.primaryText,
                    marginBottom: 8,
                  }}
                >
                  <b>Ингредиенты:</b>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {ingredients.map((ingredient, i) => (
                      <li key={i}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
                <div
                  style={{
                    fontSize: "1.02rem",
                    color: theme.secondaryText,
                    marginBottom: 8,
                  }}
                >
                  <b>Инструкция:</b>
                  <ol style={{ margin: 0, paddingLeft: 20 }}>
                    {(recipe.instructions || []).map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
                <div
                  style={{
                    color: theme.accentBlue,
                    fontSize: "0.99rem",
                    marginBottom: 6,
                  }}
                >
                  ⏱️ {recipe.prep_time || "—"} мин. &nbsp;|&nbsp; 🍽️ {recipe.servings || "—"}{" "}
                  порций
                </div>
                <div
                  style={{
                    background: "rgba(143,188,187,0.09)",
                    borderRadius: 8,
                    padding: "8px 12px",
                    marginBottom: 6,
                    color: theme.accentGreen,
                  }}
                >
                  <b>Заметка:</b>{" "}
                  {editNote.id === recipe.id ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        value={editNote.text}
                        onChange={(e) =>
                          setEditNote({ id: recipe.id, text: e.target.value })
                        }
                        style={{
                          background: theme.sidebar,
                          color: theme.primaryText,
                          border: `1px solid ${theme.accentGreen}`,
                          borderRadius: 6,
                          padding: "5px 8px",
                          flex: 1,
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveNote(recipe.id)}
                        style={{
                          background: theme.accentGreen,
                          color: theme.background,
                          border: "none",
                          borderRadius: 6,
                          padding: "5px 10px",
                          cursor: "pointer",
                        }}
                      >
                        OK
                      </button>
                    </span>
                  ) : (
                    <span
                      style={{ cursor: "pointer", marginLeft: 8 }}
                      title="Редактировать заметку"
                      onClick={() =>
                        setEditNote({ id: recipe.id, text: recipe.note || "" })
                      }
                    >
                      {recipe.note || "Добавить заметку..."}
                    </span>
                  )}
                </div>
                {recipe.is_generated && (
                  <div style={{ color: theme.accentPurple, fontSize: "0.95rem", marginTop: 8 }}>
                    ✨ Сгенерировано AI
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
