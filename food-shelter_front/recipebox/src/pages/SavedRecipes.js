import React from "react";
import theme from "../theme";
import {motion, AnimatePresence} from "framer-motion";

// Моковые рецепты для примера
const MOCK_RECIPES = [
  {
    id: 1,
    title: "Панкейки",
    liked: true,
    note: "Дети в восторге!",
    ingredients: [
      "Молоко — 200 мл",
      "Яйца — 2 шт.",
      "Мука — 150 г",
      "Сахар — 2 ст. л.",
    ],
    instructions: [
      "Смешайте молоко, яйца, муку и сахар.",
      "Выпекайте на разогретой сковороде до румяной корочки.",
      "Подавайте с медом или вареньем.",
    ],
    prep_time: 25,
    servings: 3,
  },
  {
    id: 2,
    title: "Овсяная каша",
    liked: false,
    note: "",
    ingredients: [
      "Овсяные хлопья — 60 г",
      "Молоко — 250 мл",
      "Соль — щепотка",
      "Сахар — по вкусу",
    ],
    instructions: [
      "Доведите молоко до кипения.",
      "Добавьте хлопья, соль, сахар.",
      "Варите 5-7 минут, периодически помешивая.",
    ],
    prep_time: 12,
    servings: 1,
  },
];

export default function SavedRecipes() {
  const [recipes, setRecipes] = React.useState(MOCK_RECIPES);
  const [search, setSearch] = React.useState("");

  const [editNote, setEditNote] = React.useState({ id: null, text: "" });

  // Поиск по названию
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(search.toLowerCase())
  );

  // Удалить рецепт
  const handleDelete = (id) => setRecipes(recipes.filter((r) => r.id !== id));

  // Лайк/дизлайк
  const handleLike = (id) =>
    setRecipes(
      recipes.map((r) => (r.id === id ? { ...r, liked: !r.liked } : r))
    );

  // Сохранить заметку
  const handleSaveNote = (id) => {
    setRecipes(
      recipes.map((r) => (r.id === id ? { ...r, note: editNote.text } : r))
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

      {filteredRecipes.length === 0 ? (
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
          <AnimatePresence>
            {filteredRecipes.map((recipe) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.24 }}
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
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
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
                        color: recipe.liked
                          ? theme.accentPurple
                          : theme.secondaryText,
                        cursor: "pointer",
                        marginLeft: 8,
                      }}
                      onClick={() => handleLike(recipe.id)}
                      title={
                        recipe.liked
                          ? "Убрать из любимых"
                          : "Отметить как любимое"
                      }
                    >
                      {recipe.liked ? "♥" : "♡"}
                    </span>
                  </div>
                  {/* Кнопка удалить — строго в правом верхнем углу */}
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
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i}>{ing}</li>
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
                    {recipe.instructions.map((step, i) => (
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
                  ⏱️ {recipe.prep_time} мин. &nbsp;|&nbsp; 🍽️ {recipe.servings}{" "}
                  порций
                </div>
                {/* Заметка */}
                <div
                  style={{
                    background: "rgba(143,188,187,0.09)",
                    borderRadius: 8,
                    padding: "8px 12px",
                    marginBottom: 6,
                    color: theme.accentGreen,
                  }}
                >
                  <b>Заметка:</b>
                  {editNote.id === recipe.id ? (
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <input
                        value={editNote.text}
                        onChange={(e) =>
                          setEditNote({ id: recipe.id, text: e.target.value })
                        }
                        style={{
                          background: theme.background,
                          color: theme.primaryText,
                          border: `1px solid ${theme.card}`,
                          borderRadius: 6,
                          marginLeft: 8,
                          marginRight: 8,
                          padding: "3px 8px",
                        }}
                      />
                      <button
                        onClick={() => handleSaveNote(recipe.id)}
                        style={{
                          background: theme.accentGreen,
                          color: theme.background,
                          border: "none",
                          borderRadius: 6,
                          padding: "4px 12px",
                          cursor: "pointer",
                        }}
                      >
                        Сохранить
                      </button>
                    </span>
                  ) : (
                    <span style={{ marginLeft: 8 }}>
                      {recipe.note || (
                        <span style={{ color: theme.secondaryText }}>
                          Нет заметки
                        </span>
                      )}
                      <button
                        style={{
                          marginLeft: 8,
                          background: "none",
                          border: "none",
                          color: theme.accentBlue,
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          setEditNote({
                            id: recipe.id,
                            text: recipe.note || "",
                          })
                        }
                      >
                        ✏️
                      </button>
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
