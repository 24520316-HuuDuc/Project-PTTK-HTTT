// Cửa sổ chi tiết sản phẩm — TV2 PHỤ TRÁCH (UC05). Nút giỏ hàng gọi CartContext của TV3.
import { useState } from "react";
import { X, ShoppingCart, PackageCheck, Zap, ShieldCheck, Minus, Plus } from "lucide-react";
import { getProductImage } from "../lib/anh";
import { formatMoney } from "../lib/format";
import { useCart } from "../context/CartContext";
import "./ProductDetail.css";

function ProductDetail({ product, onClose }) {
  const { add, buyNow } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const stock = Number(product.stock || 0);
  const image = getProductImage(product);

  const handleAdd = async () => {
    if (await add(product, quantity)) onClose();
  };

  const handleBuyNow = async () => {
    onClose();
    await buyNow(product);
  };

  const specs =
    product.specs && typeof product.specs === "object" && !Array.isArray(product.specs)
      ? Object.entries(product.specs)
      : product.specs
        ? [["Thông số", String(product.specs)]]
        : [];

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="detail-close" onClick={onClose} aria-label="Đóng chi tiết sản phẩm">
          <X size={22} />
        </button>

        <div className="detail-content">
          <div className="detail-image">
            <img
              src={image}
              alt={product.name}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = getProductImage({});
              }}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>

          <div className="detail-info">
            <span className="product-category">{product.category || "Sản phẩm công nghệ"}</span>
            <h2>{product.name}</h2>
            <p className="detail-sku">
              Mã sản phẩm: <strong>{product.sku}</strong>
            </p>
            <p className="detail-brand">
              Thương hiệu: <strong>{product.brand || "Chưa cập nhật"}</strong>
            </p>

            <div className="detail-price">
              <strong>{formatMoney(product.price)}</strong>
            </div>

            <div className={`detail-stock ${stock > 0 ? "in-stock" : "out-stock"}`}>
              <PackageCheck size={18} />
              {stock > 0 ? `Còn ${stock} sản phẩm` : "Tạm hết hàng"}
            </div>

            {stock > 0 && (
              <div className="detail-quantity">
                <span>Số lượng</span>
                <div className="quantity-control">
                  <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Giảm">
                    <Minus size={14} />
                  </button>
                  <span>{quantity}</span>
                  <button type="button" onClick={() => setQuantity((q) => Math.min(stock, q + 1))} aria-label="Tăng">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {product.description && <p className="detail-description">{product.description}</p>}

            {specs.length > 0 && (
              <div className="detail-section">
                <h3>Thông số kỹ thuật</h3>
                <div className="detail-spec-list">
                  {specs.map(([key, value]) => (
                    <div className="detail-spec-row" key={key}>
                      <span>{key}</span>
                      <strong>{typeof value === "object" ? JSON.stringify(value) : String(value)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-service">
              <div>
                <ShieldCheck size={19} />
                <span>
                  Bảo hành: <strong>{product.warranty_months != null ? `${product.warranty_months} tháng` : "Chưa cập nhật"}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-action-bar">
          <button type="button" className="detail-add-cart" onClick={handleAdd} disabled={stock <= 0}>
            <ShoppingCart size={18} />
            Thêm vào giỏ
          </button>
          <button type="button" className="detail-buy-now" onClick={handleBuyNow} disabled={stock <= 0}>
            <Zap size={18} />
            Mua ngay
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
