import { useEffect, useMemo, useState } from "react";
import api from "./Axios";
import { useAuth } from "./AuthContext";
import { useCart } from "./Cartcontext";

export default function ShopPage({ refreshKey = 0 }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([api.get("/products"), api.get("/categories")]);
        setProducts(productsRes.data.data || []);
        setCategories(categoriesRes.data.data || []);
      } catch (error) {
        setMessage(error.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [refreshKey]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = categoryId ? String(p.categoryId) === String(categoryId) : true;
      const matchSearch = search
        ? p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.description || "").toLowerCase().includes(search.toLowerCase())
        : true;
      return matchCategory && matchSearch;
    });
  }, [products, categoryId, search]);

  const handleAdd = async (productId) => {
    if (!user) {
      setMessage("Please login first");
      return;
    }

    if (user.role !== "CUSTOMER") {
      setMessage("Only customer can add to cart");
      return;
    }

    try {
      await addItem(productId, 1);
      setMessage("Added to cart");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to add product");
    }
  };

  return (
    <section className="panel">
      <h2>Shop</h2>

      <div className="row gap-sm wrap" style={{ marginBottom: 12 }}>
        <input placeholder="Search product" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {message ? <p className="msg">{message}</p> : null}
      {loading ? <p>Loading...</p> : null}

      <div className="product-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
            <h4>{product.name}</h4>
            <p>{product.description || "No description"}</p>
            <p>Price: {Number(product.price).toFixed(2)}</p>
            <p>Stock: {product.stock}</p>
            <button onClick={() => handleAdd(product.id)} disabled={product.stock <= 0}>
              Add to cart
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
