import React from "react";
import theme from "../theme";
import ProductList from "../components/ProductList";
import { API_URL, USER_ID } from "../config";

function MyProducts() {
  const [products, setProducts] = React.useState([]);
  const [allProducts, setAllProducts] = React.useState([]); // Справочник всех продуктов
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [showModal, setShowModal] = React.useState(false);
  const [form, setForm] = React.useState({
    product_id: "",
    name: "",
    quantity: "",
    unit: "",
    category: "",
    expiry_date: "",
  });
  const [editProduct, setEditProduct] = React.useState(null);

  // Загрузка продуктов пользователя и справочника всех продуктов
  React.useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/user-products/`).then((res) => res.json()),
      fetch(`${API_URL}/products/`).then((res) => res.json()),
    ])
      .then(([userProducts, allProducts]) => {
        setProducts(userProducts);
        setAllProducts(allProducts);
        setLoading(false);
      })
      .catch(() => {
        setError("Ошибка загрузки продуктов");
        setLoading(false);
      });
  }, []);

  // Универсальная очистка формы
  const resetForm = () =>
    setForm({
      product_id: "",
      name: "",
      quantity: "",
      unit: "",
      category: "",
      expiry_date: "",
    });

  // ======= ДОБАВЛЕНИЕ/РЕДАКТИРОВАНИЕ ПРОДУКТА =========
  const handleAddOrEditProduct = async (e) => {
    e.preventDefault();
    if (!form.quantity) return;

    // 1. Выясняем product_id и name
    let usedProduct = null;
    if (form.product_id) {
      usedProduct = allProducts.find(
        (p) => String(p.id) === String(form.product_id)
      );
    } else if (form.name.trim()) {
      // Проверяем — есть ли такой продукт уже (без учёта регистра/пробелов)
      usedProduct = allProducts.find(
        (p) => p.name.trim().toLowerCase() === form.name.trim().toLowerCase()
      );
      // Если нет — создаём продукт через POST
      if (!usedProduct) {
        // Минимально: name, unit, category (можно подставить из формы)
        const res = await fetch(`${API_URL}/products/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            category: form.category || "",
            unit_type: form.unit || "",
          }),
        });
        usedProduct = await res.json();
        setAllProducts((prev) => [...prev, usedProduct]);
      }
    } else {
      setError("Выберите продукт или введите название!");
      return;
    }

    if (!usedProduct || !usedProduct.id) {
      setError("Ошибка выбора/создания продукта");
      return;
    }

    // Если мы редактируем продукт — обычный PUT
    if (editProduct) {
      fetch(`${API_URL}/user-products/${USER_ID}/${editProduct.product_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: USER_ID,
          product_id: editProduct.product_id,
          quantity: form.quantity,
          expiry_date: form.expiry_date || null,
        }),
      })
        .then((res) => res.json())
        .then((updatedProduct) => {
          setProducts((prev) =>
            prev.map((p) =>
              p.product_id === updatedProduct.product_id ? updatedProduct : p
            )
          );
          setShowModal(false);
          setEditProduct(null);
          resetForm();
        });
      return;
    }

    // 2. Проверяем, есть ли уже user_product с этим продуктом
    const exists = products.find(
      (p) => String(p.product_id) === String(usedProduct.id)
    );

    if (exists) {
      // Если есть — делаем PUT, увеличиваем quantity
      fetch(`${API_URL}/user-products/${USER_ID}/${usedProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: USER_ID,
          product_id: usedProduct.id,
          quantity: Number(exists.quantity) + Number(form.quantity),
          expiry_date: form.expiry_date || exists.expiry_date || null,
        }),
      })
        .then((res) => res.json())
        .then((updatedProduct) => {
          setProducts((prev) =>
            prev.map((p) =>
              p.product_id === updatedProduct.product_id ? updatedProduct : p
            )
          );
          setShowModal(false);
          resetForm();
        });
    } else {
      // Если нет — делаем POST
      fetch(`${API_URL}/user-products/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: USER_ID,
          product_id: usedProduct.id,
          quantity: form.quantity,
          expiry_date: form.expiry_date || null,
        }),
      })
        .then((res) => res.json())
        .then((newProduct) => {
          setProducts((prev) => [...prev, newProduct]);
          setShowModal(false);
          resetForm();
        });
    }
  };

  // ======= УДАЛЕНИЕ =======
  const handleDeleteProduct = (product_id) => {
    fetch(`${API_URL}/user-products/${USER_ID}/${product_id}`, {
      method: "DELETE",
    }).then(() => {
      setProducts((prev) => prev.filter((p) => p.product_id !== product_id));
    });
  };

  // ======= РЕДАКТИРОВАНИЕ =======
  const handleEditProduct = (product) => {
    const selectedProduct =
      allProducts.find((p) => p.id === product.product_id) || {};

    setEditProduct(product);
    setForm({
      product_id: product.product_id,
      name: selectedProduct.name || "",
      quantity: product.quantity,
      unit: selectedProduct.unit_type || product.unit || "",
      category: selectedProduct.category || product.category || "",
      expiry_date: product.expiry_date ? product.expiry_date.split("T")[0] : "",
    });
    setShowModal(true);
  };

  // ======= Select продукт — сразу подставить unit/category/name =======
  const handleProductChange = (e) => {
    const newProductId = e.target.value;
    const selectedProduct = allProducts.find(
      (p) => String(p.id) === String(newProductId)
    );
    setForm((prev) => ({
      ...prev,
      product_id: newProductId,
      name: selectedProduct ? selectedProduct.name : "",
      unit: selectedProduct ? selectedProduct.unit_type : "",
      category: selectedProduct ? selectedProduct.category : "",
    }));
  };

  // ======= Изменение имени вручную — сбрасываем select =======
  const handleNameInput = (e) => {
    setForm((prev) => ({
      ...prev,
      name: e.target.value,
      product_id: "",
    }));
  };

  // ======= Фильтрация и отображение =======
  const filteredProducts = products
    .filter((product) => {
      const prod = allProducts.find((p) => p.id === product.product_id);
      const name = prod ? prod.name : "";
      return name.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => {
      if (!a.expiry_date) return 1;
      if (!b.expiry_date) return -1;
      return new Date(a.expiry_date) - new Date(b.expiry_date);
    })
    .map((product) => {
      const prod = allProducts.find((p) => p.id === product.product_id);
      return {
        ...product,
        name: prod ? prod.name : "",
        unit: prod ? prod.unit_type : "",
        category: prod ? prod.category : "",
      };
    });

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
          My Products
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
          onClick={() => {
            resetForm();
            setEditProduct(null);
            setShowModal(true);
          }}
        >
          + Add product
        </button>
      </div>
      <div style={{ marginBottom: "24px", maxWidth: 340 }}>
        <input
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "7px",
            border: `1.5px solid ${theme.card}`,
            background: theme.sidebar,
            color: theme.primaryText,
            fontSize: "1.02rem",
          }}
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div
        style={{
          background: theme.card,
          borderRadius: "18px",
          minHeight: "400px",
          padding: "32px",
        }}
      >
        {loading ? (
          <div style={{ color: theme.secondaryText }}>Загрузка...</div>
        ) : error ? (
          <div style={{ color: theme.accentOrange }}>{error}</div>
        ) : (
          <ProductList
            products={filteredProducts}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />
        )}
      </div>

      {/* Модальное окно добавления/редактирования продукта */}
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
            onSubmit={handleAddOrEditProduct}
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
            <h2 style={{ margin: 0 }}>
              {editProduct ? "Edit Product" : "Add Product"}
            </h2>
            <select
              style={{
                padding: "10px",
                borderRadius: "6px",
                border: `1.5px solid ${theme.card}`,
                background: theme.card,
                color: theme.primaryText,
                fontSize: "1.05rem",
              }}
              value={form.product_id}
              onChange={handleProductChange}
              disabled={!!editProduct}
            >
              <option value="">Select product...</option>
              {allProducts.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name}
                </option>
              ))}
            </select>
            <input
              placeholder="Name (for new product)"
              style={{
                padding: "10px",
                borderRadius: "6px",
                border: `1.5px solid ${theme.card}`,
                background: theme.card,
                color: theme.primaryText,
              }}
              value={form.name}
              onChange={handleNameInput}
              disabled={!!form.product_id || !!editProduct}
              required={!form.product_id}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                placeholder="Quantity"
                type="number"
                min="0"
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "6px",
                  border: `1.5px solid ${theme.card}`,
                  background: theme.card,
                  color: theme.primaryText,
                }}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
              />
              <input
                placeholder="Unit (for new)"
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "6px",
                  border: `1.5px solid ${theme.card}`,
                  background: theme.card,
                  color: theme.primaryText,
                }}
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                readOnly={!!form.product_id || !!editProduct}
                tabIndex={-1}
              />
            </div>
            <input
              placeholder="Category (for new)"
              style={{
                padding: "10px",
                borderRadius: "6px",
                border: `1.5px solid ${theme.card}`,
                background: theme.card,
                color: theme.primaryText,
              }}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              readOnly={!!form.product_id || !!editProduct}
              tabIndex={-1}
            />
            <input
              type="date"
              placeholder="Expiry date"
              style={{
                padding: "10px",
                borderRadius: "6px",
                border: `1.5px solid ${theme.card}`,
                background: theme.card,
                color: theme.primaryText,
              }}
              value={form.expiry_date || ""}
              onChange={(e) =>
                setForm({ ...form, expiry_date: e.target.value })
              }
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
                {editProduct ? "Save changes" : "Save"}
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
                  resetForm();
                  setEditProduct(null);
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

export default MyProducts;
