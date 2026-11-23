// Trạng thái đăng nhập dùng chung — TV1 PHỤ TRÁCH
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getToken, setToken, setUnauthorizedHandler } from "../api/client";
import * as accountsApi from "../api/accounts";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(getToken())); // đang kiểm tra token cũ

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  // Có token từ lần trước -> hỏi server thông tin người dùng
  useEffect(() => {
    setUnauthorizedHandler(logout);
    if (!getToken()) return;
    accountsApi
      .getMe()
      .then((data) => setUser(data.user))
      .catch(() => logout())
      .finally(() => setChecking(false));
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const data = await accountsApi.login(email, password);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const value = useMemo(
    () => ({
      user,
      checking,
      login,
      logout,
      setUser,
      isCustomer: user?.role === "customer",
      isStaff: user?.role === "employee" || user?.role === "manager",
      isManager: user?.role === "manager",
    }),
    [user, checking, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
