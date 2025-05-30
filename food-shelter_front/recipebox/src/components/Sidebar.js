// src/components/Sidebar.js
import React from 'react';
import theme from '../theme';

function Sidebar({ onSelect, activePage }) {
  return (
    <aside
      style={{
        width: "260px",
        background: theme.sidebar,
        minHeight: "100vh",
        padding: "32px 0 0 0",
        boxSizing: "border-box",
        borderRight: `1.5px solid ${theme.card}`,
      }}
    >
      <div
        style={{
          fontWeight: "bold",
          fontSize: "2rem",
          padding: "0 0 40px 36px",
          color: theme.accentGreen,
          letterSpacing: "1px",
        }}
      >
        RecipeBox
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        <li
          style={{
            background: activePage === "products" ? theme.card : "none",
            color:
              activePage === "products" ? theme.accentGreen : theme.primaryText,
            padding: "16px 0 16px 36px",
            fontWeight: activePage === "products" ? "600" : "400",
            cursor: "pointer",
            borderRadius: "8px",
            margin: "4px 12px",
            transition: "background 0.18s, color 0.18s",
          }}
          onClick={() => onSelect("products")}
        >
          <span role="img" aria-label="Products">
            📋
          </span>{" "}
          My Products
        </li>
        {/* ...остальные пункты меню аналогично */}
        <li
          style={{
            background: activePage === "shopping" ? theme.card : "none",
            color:
              activePage === "shopping" ? theme.accentGreen : theme.primaryText,
            padding: "16px 0 16px 36px",
            fontWeight: activePage === "shopping" ? "600" : "400",
            cursor: "pointer",
            borderRadius: "8px",
            margin: "4px 12px",
            transition: "background 0.18s, color 0.18s",
          }}
          onClick={() => onSelect("shopping")}
        >
          <span role="img" aria-label="Shopping">
            🛒
          </span>{" "}
          Shopping Lists
        </li>
        <li
          style={{
            background: activePage === "generator" ? theme.card : "none",
            color:
              activePage === "generator"
                ? theme.accentGreen
                : theme.primaryText,
            padding: "16px 0 16px 36px",
            fontWeight: activePage === "generator" ? "600" : "400",
            cursor: "pointer",
            borderRadius: "8px",
            margin: "4px 12px",
            transition: "background 0.18s, color 0.18s",
          }}
          onClick={() => onSelect("generator")}
        >
          <span role="img" aria-label="Generator">
            ✨
          </span>{" "}
          Recipe Generator
        </li>
        <li
          style={{
            background: activePage === "saved" ? theme.card : "none",
            color:
              activePage === "saved" ? theme.accentGreen : theme.primaryText,
            padding: "16px 0 16px 36px",
            fontWeight: activePage === "saved" ? "600" : "400",
            cursor: "pointer",
            borderRadius: "8px",
            margin: "4px 12px",
            transition: "background 0.18s, color 0.18s",
          }}
          onClick={() => onSelect("saved")}
        >
          <span role="img" aria-label="Saved">
            📑
          </span>{" "}
          Saved Recipes
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
