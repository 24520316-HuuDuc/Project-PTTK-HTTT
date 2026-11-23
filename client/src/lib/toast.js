// Thông báo nhỏ góc màn hình. Dùng: toast("Đã thêm vào giỏ") hoặc toast("Lỗi...", "error")
export function toast(message, type = "success") {
  window.dispatchEvent(new CustomEvent("hdx-toast", { detail: { message, type, id: Date.now() + Math.random() } }));
}
