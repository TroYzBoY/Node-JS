import { useEffect, useMemo, useState } from "react";
import "./App.css";
import api from "./Axios";
import { useAuth } from "./AuthContext";
import { useCart } from "./Cartcontext";
import ShopPage from "./Shoppage";

function AuthPanel() {
  const { user, login, register, logout } = useAuth();
  const googleEnabled = import.meta.env.VITE_ENABLE_GOOGLE === "true";
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "CUSTOMER" });
  const [message, setMessage] = useState("");

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (isRegister) {
        await register(form);
        setMessage("Registered and logged in");
      } else {
        await login(form.email, form.password);
        setMessage("Logged in");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Auth failed");
    }
  };

  return (
    <section className="panel">
      <h2>Authentication</h2>

      {!user ? (
        <form onSubmit={onSubmit} className="form-grid">
          {isRegister ? (
            <>
              <input name="name" placeholder="Name" value={form.name} onChange={onChange} required />
              <select name="role" value={form.role} onChange={onChange}>
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="SELLER">SELLER</option>
              </select>
            </>
          ) : null}

          <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={onChange}
            required
          />

          <div className="row gap-sm">
            <button type="submit">{isRegister ? "Register" : "Login"}</button>
            <button type="button" onClick={() => setIsRegister((v) => !v)}>
              {isRegister ? "Switch to Login" : "Switch to Register"}
            </button>
            {googleEnabled ? (
              <a className="link-btn" href="http://localhost:5000/api/v1/auth/google">
                Google Login
              </a>
            ) : (
              <span className="msg">Google login disabled (configure .env)</span>
            )}
          </div>

          {message ? <p className="msg">{message}</p> : null}
        </form>
      ) : (
        <div className="row between">
          <p>
            Logged in as <b>{user.name}</b> ({user.role})
          </p>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </section>
  );
}

function CustomerCartPanel() {
  const { user } = useAuth();
  const { cart, itemCount, total, updateItem, removeItem, checkout } = useCart();
  const [message, setMessage] = useState("");

  if (user?.role !== "CUSTOMER") return null;

  const onCheckout = async () => {
    setMessage("");
    try {
      const order = await checkout();
      setMessage(`Order #${order.id} created`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Checkout failed");
    }
  };

  return (
    <section className="panel">
      <h2>My Cart</h2>
      <p>Items: {itemCount}</p>
      <p>Total: {total.toFixed(2)}</p>

      <div className="stack">
        {cart?.items?.map((item) => (
          <div key={item.id} className="row between card-line">
            <span>
              {item.product?.name} x {item.quantity}
            </span>
            <div className="row gap-sm">
              <button onClick={() => updateItem(item.id, item.quantity + 1)}>+</button>
              <button onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}>-</button>
              <button onClick={() => removeItem(item.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={onCheckout} disabled={!cart?.items?.length}>
        Checkout
      </button>
      {message ? <p className="msg">{message}</p> : null}
    </section>
  );
}

function SellerAdminPanel({ onRefresh }) {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
  });
  const [categoryName, setCategoryName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const canManageProducts = user?.role === "SELLER" || user?.role === "ADMIN";
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!canManageProducts) return;

    const run = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data.data || []);
      } catch {
        setCategories([]);
      }
    };

    run();
  }, [canManageProducts]);

  useEffect(() => {
    if (!isAdmin) return;

    const run = async () => {
      try {
        const res = await api.get("/admin/orders");
        setOrders(res.data.data || []);
      } catch {
        setOrders([]);
      }
    };

    run();
  }, [isAdmin]);

  const createProduct = async (e) => {
    e.preventDefault();
    setStatusMessage("");
    try {
      await api.post("/products", {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        categoryId: Number(productForm.categoryId),
      });
      setProductForm({ name: "", description: "", price: "", stock: "", categoryId: "" });
      setStatusMessage("Product created");
      onRefresh();
    } catch (error) {
      setStatusMessage(error.response?.data?.message || "Create product failed");
    }
  };

  const createCategory = async (e) => {
    e.preventDefault();
    setStatusMessage("");
    try {
      await api.post("/categories", { name: categoryName });
      const res = await api.get("/categories");
      setCategories(res.data.data || []);
      setCategoryName("");
      setStatusMessage("Category created");
      onRefresh();
    } catch (error) {
      setStatusMessage(error.response?.data?.message || "Create category failed");
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    setStatusMessage("");
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      setStatusMessage(`Order #${orderId} updated to ${status}`);
    } catch (error) {
      setStatusMessage(error.response?.data?.message || "Update order status failed");
    }
  };

  if (!canManageProducts && !isAdmin) return null;

  return (
    <section className="panel">
      <h2>Management</h2>

      {canManageProducts ? (
        <form onSubmit={createProduct} className="form-grid" style={{ marginBottom: 16 }}>
          <h3>Create Product</h3>
          <input
            placeholder="Name"
            value={productForm.name}
            onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
            required
          />
          <input
            placeholder="Description"
            value={productForm.description}
            onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Price"
            value={productForm.price}
            onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))}
            required
          />
          <input
            type="number"
            min="0"
            step="1"
            placeholder="Stock"
            value={productForm.stock}
            onChange={(e) => setProductForm((p) => ({ ...p, stock: e.target.value }))}
            required
          />
          <select
            value={productForm.categoryId}
            onChange={(e) => setProductForm((p) => ({ ...p, categoryId: e.target.value }))}
            required
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <button type="submit">Create Product</button>
        </form>
      ) : null}

      {isAdmin ? (
        <form onSubmit={createCategory} className="form-grid" style={{ marginBottom: 16 }}>
          <h3>Create Category</h3>
          <input
            placeholder="Category name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />
          <button type="submit">Create Category</button>
        </form>
      ) : null}

      {isAdmin ? (
        <div>
          <h3>Orders</h3>
          <div className="stack">
            {orders.map((order) => (
              <div key={order.id} className="row between card-line">
                <span>
                  #{order.id} - {order.status} - {Number(order.totalPrice).toFixed(2)}
                </span>
                <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)}>
                  <option value="PENDING">PENDING</option>
                  <option value="PAID">PAID</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {statusMessage ? <p className="msg">{statusMessage}</p> : null}
    </section>
  );
}

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="app-shell">
      <AuthPanel />
      <CustomerCartPanel />
      <SellerAdminPanel onRefresh={() => setRefreshKey((v) => v + 1)} />
      <ShopPage refreshKey={refreshKey} />
    </div>
  );
}

export default App;
