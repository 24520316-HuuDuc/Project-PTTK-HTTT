// Hàm gọi API dùng chung — PHẦN CHUNG
// Mọi request đi qua /api (Vite proxy sang server Express cổng 3001).

const TOKEN_KEY = "hdx_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) =>
  token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY);

/** Gọi khi server trả 401 (hết phiên) — AuthContext gán hàm đăng xuất vào đây. */
let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

/**
 * request("GET", "/products", { query: { q: "chuột" } })
 * request("POST", "/orders", { body: {...} })
 */
export async function request(method, path, { body, query } = {}) {
  const params = new URLSearchParams();
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.append(key, value);
  });
  const url = `/api${path}${params.toString() ? `?${params}` : ""}`;

  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error("Không kết nối được máy chủ. Hãy kiểm tra server đã chạy chưa (npm run dev trong thư mục server).");
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    // phản hồi không phải JSON
  }

  if (res.status === 401 && token) onUnauthorized();
  if (!res.ok) throw new Error(data.message || `Lỗi ${res.status}`);
  return data;
}

export const api = {
  get: (path, query) => request("GET", path, { query }),
  post: (path, body) => request("POST", path, { body }),
  put: (path, body) => request("PUT", path, { body }),
  patch: (path, body) => request("PATCH", path, { body }),
  del: (path) => request("DELETE", path),
};
