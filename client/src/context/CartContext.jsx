// Giỏ hàng dùng chung, lưu trên server (bảng Carts, CartDetails) — TV3 PHỤ TRÁCH
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import * as shoppingApi from "../api/shopping";
import { toast } from "../lib/toast";

const CartContext = createContext(null);
const EMPTY = { items: [], count: 0, total: 0 };

export function CartProvider({ children }) {
  const { user, isCustomer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [cart, setCart] = useState(EMPTY);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);

  const reload = useCallback(async () => {
    if (!isCustomer) {
      setCart(EMPTY);
      return;
    }
    try {
      setCart(await shoppingApi.getCart());
    } catch (err) {
      toast(err.message, "error");
    }
  }, [isCustomer]);

  useEffect(() => {
    reload();
  }, [reload, user]);

  /** Chưa đăng nhập -> chuyển tới trang đăng nhập; tài khoản quản trị -> không cho mua. */
  const ensureCustomer = useCallback(() => {
    if (!user) {
      toast("Vui lòng đăng nhập để mua hàng.", "error");
      navigate("/login", { state: { from: location.pathname } });
      return false;
    }
    if (!isCustomer) {
      toast("Tài khoản quản trị không dùng để mua hàng.", "error");
      return false;
    }
    return true;
  }, [user, isCustomer, navigate, location.pathname]);

  const add = useCallback(
    async (product, quantity = 1) => {
      if (!ensureCustomer()) return false;
      try {
        const data = await shoppingApi.addToCart(product.product_id, quantity);
        setCart(data);
        toast(`Đã thêm "${product.name}" vào giỏ.`);
        return true;
      } catch (err) {
        toast(err.message, "error");
        return false;
      }
    },
    [ensureCustomer]
  );

  /** Mua ngay: thêm vào giỏ rồi mở form đặt hàng. */
  const buyNow = useCallback(
    async (product) => {
      if (await add(product, 1)) {
        setCartOpen(false);
        setCheckoutOpen(true);
      }
    },
    [add]
  );

  const update = useCallback(async (productId, quantity) => {
    try {
      setCart(await shoppingApi.updateCartItem(productId, quantity));
    } catch (err) {
      toast(err.message, "error");
    }
  }, []);

  const remove = useCallback(async (productId) => {
    try {
      setCart(await shoppingApi.removeCartItem(productId));
    } catch (err) {
      toast(err.message, "error");
    }
  }, []);

  const value = useMemo(
    () => ({
      ...cart,
      add,
      buyNow,
      update,
      remove,
      reload,
      isCartOpen,
      setCartOpen,
      isCheckoutOpen,
      setCheckoutOpen,
    }),
    [cart, add, buyNow, update, remove, reload, isCartOpen, isCheckoutOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
