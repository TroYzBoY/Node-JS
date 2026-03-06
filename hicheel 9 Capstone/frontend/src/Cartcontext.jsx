import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "./Axios";
import { useAuth } from "./Authcontext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user || user.role !== "CUSTOMER") {
      setCart(null);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/cart");
      setCart(res.data.data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(async (productId, quantity = 1) => {
    const res = await api.post("/cart/items", { productId, quantity });
    setCart(res.data.data);
    return res.data.data;
  }, []);

  const updateItem = useCallback(async (cartItemId, quantity) => {
    const res = await api.patch(`/cart/items/${cartItemId}`, { quantity });
    setCart(res.data.data);
    return res.data.data;
  }, []);

  const removeItem = useCallback(async (cartItemId) => {
    const res = await api.delete(`/cart/items/${cartItemId}`);
    setCart(res.data.data);
    return res.data.data;
  }, []);

  const checkout = useCallback(async () => {
    const res = await api.post("/orders");
    await fetchCart();
    return res.data.data;
  }, [fetchCart]);

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const total =
    cart?.items?.reduce((sum, item) => sum + Number(item.product?.price || 0) * item.quantity, 0) || 0;

  const value = useMemo(
    () => ({
      cart,
      loading,
      itemCount,
      total,
      fetchCart,
      addItem,
      updateItem,
      removeItem,
      checkout,
    }),
    [cart, loading, itemCount, total, fetchCart, addItem, updateItem, removeItem, checkout],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
