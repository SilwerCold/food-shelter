import React from "react";
import theme from "../theme";
import { API_URL, USER_ID } from "../config";

function ShoppingLists() {
  // Состояния
  const [lists, setLists] = React.useState([]);
  const [allProducts, setAllProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [showModal, setShowModal] = React.useState(false);
  const [form, setForm] = React.useState({ name: "" });

  // === 1. Загрузка справочника продуктов и списков покупок ===
  React.useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/products/`).then((res) => res.json()),
      fetch(`${API_URL}/shopping-lists/`).then((res) => res.json()),
    ])
      .then(([products, lists]) => {
        setAllProducts(products);
        setLists(lists);
        setLoading(false);
      })
      .catch(() => {
        setError("Ошибка загрузки");
        setLoading(false);
      });
  }, []);

  // === 2. Получить все товары конкретного списка ===
  const fetchListItems = (listId) =>
    fetch(`${API_URL}/shopping-list-items/?list_id=${listId}`).then((res) =>
      res.json()
    );

  // === 3. Добавление нового списка (POST /shopping-lists) ===
  const handleAddList = (e) => {
    e.preventDefault();
    if (!form.name) return;
    fetch(`${API_URL}/shopping-lists/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: USER_ID, name: form.name }),
    })
      .then((res) => res.json())
      .then((newList) => {
        setLists((prev) => [...prev, newList]);
        setForm({ name: "" });
        setShowModal(false);
      });
  };

  // === 4. Удаление списка (DELETE /shopping-lists/{id}) ===
  const handleDeleteList = (listId) => {
    fetch(`${API_URL}/shopping-lists/${listId}`, {
      method: "DELETE",
    }).then(() => setLists((prev) => prev.filter((l) => l.id !== listId)));
  };

  // === 5. Добавление товара в список (POST /shopping-list-items) ===
  const handleAddItem = (listId, item) => {
    const selectedProduct = allProducts.find(
      (p) => p.name.toLowerCase() === item.name.toLowerCase()
    );
    if (!selectedProduct) {
      alert("Выберите существующий продукт!");
      return;
    }
    fetch(`${API_URL}/shopping-list-items/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        list_id: listId,
        product_id: selectedProduct.id,
        quantity: item.quantity,
        is_bought: false,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        // Перезагрузим элементы списка!
        fetchListItems(listId).then((items) => {
          setLists((prev) =>
            prev.map((l) => (l.id === listId ? { ...l, items } : l))
          );
        });
      });
  };

  // === 6. Удаление товара из списка (DELETE /shopping-list-items/{list_id}/{product_id}) ===
  const handleDeleteItem = (listId, productId) => {
    fetch(`${API_URL}/shopping-list-items/${listId}/${productId}`, {
      method: "DELETE",
    }).then(() =>
      fetchListItems(listId).then((items) => {
        setLists((prev) =>
          prev.map((l) => (l.id === listId ? { ...l, items } : l))
        );
      })
    );
  };

  // === 7. Отметить товар как купленный (PUT /shopping-list-items/{list_id}/{product_id}) ===
const handleToggleBought = (listId, productId, currentValue, quantity) => {
  fetch(`${API_URL}/shopping-list-items/${listId}/${productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: productId,
      list_id: listId,
      quantity: quantity,
      is_bought: !currentValue}),
  })
    .then((res) => res.json())
    .then(() => {
      fetchListItems(listId).then((items) => {
        setLists((prev) =>
          prev.map((l) => (l.id === listId ? { ...l, items } : l))
        );
      });
    });
};

  // === 8. При открытии списка — догружай его items (useEffect внутри map для каждого списка) ===
  React.useEffect(() => {
    lists.forEach((list) => {
      if (!list.items) {
        fetchListItems(list.id).then((items) => {
          setLists((prev) =>
            prev.map((l) => (l.id === list.id ? { ...l, items } : l))
          );
        });
      }
    });
    // eslint-disable-next-line
  }, [lists.length]);

  // ===== Отображение =====
  return (
    <div style={{ padding: "48px 40px 0 40px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "600",
            marginBottom: "36px",
            color: theme.primaryText,
          }}
        >
          Shopping Lists
        </h1>
        <button
          style={{
            background: theme.accentGreen,
            color: theme.background,
            border: "none",
            borderRadius: "12px",
            padding: "12px 24px",
            fontSize: "1.1rem",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
          }}
          onClick={() => setShowModal(true)}
        >
          + New List
        </button>
      </div>

      {/* Отображение всех списков */}
      {loading ? (
        <div style={{ color: theme.secondaryText }}>Загрузка...</div>
      ) : error ? (
        <div style={{ color: theme.accentOrange }}>{error}</div>
      ) : lists.length === 0 ? (
        <div
          style={{
            background: theme.card,
            borderRadius: "18px",
            minHeight: "200px",
            padding: "32px",
            color: theme.secondaryText,
          }}
        >
          Пока у вас нет списков покупок. Создайте первый!
        </div>
      ) : (
        lists.map((list) => (
          <div
            key={list.id}
            style={{
              background: theme.card,
              borderRadius: "18px",
              marginBottom: "28px",
              padding: "24px 32px 16px 32px",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 600,
                  color: theme.accentBlue,
                }}
              >
                {list.name}
              </div>
              <button
                style={{
                  background: "none",
                  color: theme.accentOrange,
                  border: "none",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  cursor: "pointer",
                }}
                onClick={() => handleDeleteList(list.id)}
                title="Удалить список"
              >
                🗑️
              </button>
            </div>
            {/* Отображение товаров */}
            {!list.items || list.items.length === 0 ? (
              <div style={{ color: theme.secondaryText, padding: "18px" }}>
                Список пуст.
              </div>
            ) : (
              <ul
                style={{ margin: "16px 0 0 0", padding: 0, listStyle: "none" }}
              >
                {list.items.map((item) => {
                  // Поиск названия продукта по product_id
                  const prod = allProducts.find(
                    (p) => p.id === item.product_id
                  );
                  return (
                    <li
                      key={item.product_id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "10px",
                        background: item.is_bought
                          ? "rgba(143, 188, 187, 0.18)"
                          : "transparent",
                        borderRadius: "8px",
                        padding: "6px 8px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!item.is_bought}
                        onChange={() =>
                          handleToggleBought(
                            list.id,
                            item.product_id,
                            item.is_bought,
                            item.quantity
                          )
                        }
                        style={{ marginRight: 12 }}
                      />
                      <span
                        style={{
                          textDecoration: item.is_bought
                            ? "line-through"
                            : "none",
                          color: item.is_bought
                            ? theme.secondaryText
                            : theme.primaryText,
                          fontWeight: 500,
                        }}
                      >
                        {prod ? prod.name : "???"} — {item.quantity}{" "}
                        {prod ? prod.unit_type : ""}
                      </span>
                      <button
                        style={{
                          marginLeft: "auto",
                          background: "none",
                          color: theme.accentOrange,
                          border: "none",
                          fontSize: "1.1rem",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          handleDeleteItem(list.id, item.product_id)
                        }
                        title="Удалить товар"
                      >
                        🗑️
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Мини-форма для добавления товара в список */}
            <AddItemForm
              allProducts={allProducts}
              onAdd={(item) => handleAddItem(list.id, item)}
              theme={theme}
            />
          </div>
        ))
      )}

      {/* Модалка создания нового списка */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(46,52,64,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <form
            onSubmit={handleAddList}
            style={{
              background: theme.sidebar,
              padding: "36px 28px",
              borderRadius: "16px",
              minWidth: "320px",
              color: theme.primaryText,
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
            }}
          >
            <h2 style={{ margin: 0 }}>New Shopping List</h2>
            <input
              autoFocus
              placeholder="List name"
              style={{
                padding: "10px",
                borderRadius: "6px",
                border: `1.5px solid ${theme.card}`,
                background: theme.card,
                color: theme.primaryText,
              }}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  background: theme.accentBlue,
                  color: theme.background,
                  border: "none",
                  borderRadius: "7px",
                  padding: "10px 0",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Create
              </button>
              <button
                type="button"
                style={{
                  flex: 1,
                  background: theme.accentOrange,
                  color: theme.background,
                  border: "none",
                  borderRadius: "7px",
                  padding: "10px 0",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={() => {
                  setShowModal(false);
                  setForm({ name: "" });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// Мини-форма добавления товара в список (с select!)
function AddItemForm({ onAdd, theme, allProducts }) {
  const [form, setForm] = React.useState({
    product_id: "",
    name: "",
    quantity: "",
    unit: "",
  });

  // Подстановка unit по выбранному продукту
  const handleProductChange = (e) => {
    const selectedId = e.target.value;
    const selectedProduct = allProducts.find(
      (p) => String(p.id) === String(selectedId)
    );
    setForm((prev) => ({
      ...prev,
      product_id: selectedId,
      name: selectedProduct ? selectedProduct.name : "",
      unit: selectedProduct ? selectedProduct.unit_type : "",
    }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.name || !form.quantity || !form.unit) return;
        onAdd({ ...form, is_bought: false });
        setForm({ product_id: "", name: "", quantity: "", unit: "" });
      }}
      style={{ display: "flex", gap: "10px", marginTop: "16px" }}
    >
      <select
        style={{
          flex: 2,
          padding: "8px",
          borderRadius: "6px",
          border: `1.5px solid ${theme.card}`,
          background: theme.background,
          color: theme.primaryText,
        }}
        value={form.product_id}
        onChange={handleProductChange}
        required
      >
        <option value="" disabled>
          Выберите продукт
        </option>
        {allProducts &&
          allProducts.map((prod) => (
            <option key={prod.id} value={prod.id}>
              {prod.name}
            </option>
          ))}
      </select>
      <input
        placeholder="Qty"
        type="number"
        min="0"
        style={{
          flex: 1,
          padding: "8px",
          borderRadius: "6px",
          border: `1.5px solid ${theme.card}`,
          background: theme.background,
          color: theme.primaryText,
        }}
        value={form.quantity}
        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        required
      />
      <input
        placeholder="Unit"
        style={{
          flex: 1,
          padding: "8px",
          borderRadius: "6px",
          border: `1.5px solid ${theme.card}`,
          background: theme.background,
          color: theme.primaryText,
        }}
        value={form.unit}
        readOnly
      />
      <button
        type="submit"
        style={{
          background: theme.accentGreen,
          color: theme.background,
          border: "none",
          borderRadius: "6px",
          padding: "8px 16px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        +
      </button>
    </form>
  );
}

export default ShoppingLists;
