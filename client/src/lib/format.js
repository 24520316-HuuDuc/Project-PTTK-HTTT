// Hàm định dạng dùng chung

/** 1250000 -> "1.250.000đ" */
export const formatMoney = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

/** "2026-11-21 14:30:00" -> "21/11/2026 14:30" */
export function formatDateTime(value) {
  if (!value) return "";
  const [date, time = ""] = String(value).replace("T", " ").split(" ");
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y} ${time.slice(0, 5)}`.trim();
}

/** Date -> "YYYY-MM-DD" theo giờ máy */
export function toInputDate(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const daysAgo = (n) => toInputDate(Date.now() - n * 864e5);
