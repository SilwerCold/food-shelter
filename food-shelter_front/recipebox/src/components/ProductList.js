import React from "react";
import theme from "../theme";
import { motion, AnimatePresence } from "framer-motion";

function ProductList({ products, onEdit, onDelete }) {
  // Группируем продукты по категории
  const grouped = products.reduce((acc, product) => {
    const cat = product.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});

  // Нет продуктов после поиска — показываем заглушку
  if (products.length === 0) {
    return (
      <div
        style={{
          color: theme.secondaryText,
          textAlign: "center",
          padding: "48px 0",
        }}
      >
        Пока тут пусто — добавь продукт!
      </div>
    );
  }

  // Выводим группы (категории)
  return (
    <div>
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: "36px" }}>
          <div
            style={{
              fontSize: "1.15rem",
              color: theme.accentBlue,
              fontWeight: 600,
              marginBottom: "16px",
              marginTop: "16px",
            }}
          >
            {cat}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
            }}
          >
            <AnimatePresence>
            {items.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.24 }}
                style={{
                  background: theme.sidebar,
                  borderRadius: "14px",
                  padding: "20px",
                  color: theme.primaryText,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  position: "relative",
                  minHeight: "120px",
                }}
              >
                <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>
                  {product.name}
                </div>
                <div
                  style={{
                    fontSize: "0.95rem",
                    margin: "6px 0",
                    color: theme.accentGreen,
                  }}
                >
                  {product.quantity} {product.unit}
                </div>
                <div
                  style={{ fontSize: "0.85rem", color: theme.secondaryText }}
                >
                  {product.category}
                </div>
                {product.expiry_date && (
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: theme.accentOrange,
                      marginTop: 2,
                    }}
                  >
                    Expires:{" "}
                    {new Date(product.expiry_date).toLocaleDateString()}
                  </div>
                )}

                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "14px",
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <button
                    style={{
                      background: theme.accentBlue,
                      border: "none",
                      borderRadius: "5px",
                      padding: "2px 8px",
                      color: theme.background,
                      cursor: "pointer",
                    }}
                    onClick={() => onEdit(product)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    style={{
                      background: theme.accentOrange,
                      border: "none",
                      borderRadius: "5px",
                      padding: "2px 8px",
                      color: theme.background,
                      cursor: "pointer",
                    }}
                    onClick={() => onDelete(product.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductList;
