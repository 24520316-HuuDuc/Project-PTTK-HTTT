import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

/** Hiển thị các thông báo gọi bằng toast() trong lib/toast.js */
function ToastHost() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const onToast = (event) => {
      const item = event.detail;
      setItems((list) => [...list, item]);
      setTimeout(() => setItems((list) => list.filter((x) => x.id !== item.id)), 3000);
    };
    window.addEventListener("hdx-toast", onToast);
    return () => window.removeEventListener("hdx-toast", onToast);
  }, []);

  return (
    <div className="toast-host">
      {items.map((item) => (
        <div key={item.id} className={`toast toast-${item.type}`}>
          {item.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{item.message}</span>
        </div>
      ))}
    </div>
  );
}

export default ToastHost;
