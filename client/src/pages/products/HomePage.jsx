// Trang chủ + danh sách + TÌM KIẾM/LỌC sản phẩm — TV2 PHỤ TRÁCH (UC05, UC06)
// Bộ lọc nằm trên URL (?q=&category=&min=&max=&sort=) nên tải lại trang vẫn giữ kết quả.
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Truck, ShieldCheck, Headphones, Flame, ChevronRight, ShoppingBag, Sparkles, SlidersHorizontal } from "lucide-react";
import ProductCard from "../../components/ProductCard";
import ProductDetail from "../../components/ProductDetail";
import { getCategories, searchProducts } from "../../api/products";
import { useCart } from "../../context/CartContext";

const scrollToProducts = () =>
  setTimeout(() => document.getElementById("shop-products")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);

function HomePage() {
  const { add } = useCart();
  const [params, setParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Ô nhập giá (chỉ áp dụng khi bấm "Lọc")
  const [minPrice, setMinPrice] = useState(params.get("min") || "");
  const [maxPrice, setMaxPrice] = useState(params.get("max") || "");

  const filters = {
    q: params.get("q") || "",
    category: params.get("category") || "",
    min: params.get("min") || "",
    max: params.get("max") || "",
    sort: params.get("sort") || "newest",
  };
  const filterKey = params.toString();

  // Danh mục + sản phẩm nổi bật: tải 1 lần
  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data.categories))
      .catch(() => {});
    searchProducts({ sort: "newest" })
      .then((data) => setFeatured(data.products.filter((p) => p.stock > 0).slice(0, 4)))
      .catch(() => {});
  }, []);

  // Kết quả tìm kiếm: tải lại mỗi khi bộ lọc trên URL đổi
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    const query = Object.fromEntries(new URLSearchParams(filterKey));
    searchProducts(query)
      .then((data) => !cancelled && setProducts(data.products))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [filterKey]);

  /** Đổi 1 hoặc nhiều tham số lọc trên URL. */
  const setFilter = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    setParams(next);
    scrollToProducts();
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setParams(new URLSearchParams());
  };

  const activeCategory = categories.find((c) => String(c.category_id) === filters.category);
  const hasFilter = filters.q || filters.category || filters.min || filters.max;

  return (
    <>
      <nav className="main-nav">
        <div className="main-nav-inner">
          <button type="button" className={`nav-item ${!filters.category ? "active" : ""}`} onClick={() => setFilter({ category: "" })}>
            Tất cả
          </button>
          {categories.map((c) => (
            <button
              type="button"
              key={c.category_id}
              className={`nav-item ${filters.category === String(c.category_id) ? "active" : ""}`}
              onClick={() => setFilter({ category: String(c.category_id) })}
            >
              {c.name}
            </button>
          ))}
        </div>
      </nav>

      <div className="shop-container">
        {!hasFilter && (
          <>
            <section className="shop-hero">
              <div className="shop-hero-content">
                <span className="hero-kicker">
                  <Sparkles size={15} />
                  HDX TECH STORE
                </span>
                <h1>
                  Nâng cấp trải nghiệm
                  <br />
                  <span>công nghệ của bạn</span>
                </h1>
                <p>Laptop, bàn phím, chuột, tai nghe, màn hình và phụ kiện chính hãng tại HDX Tech.</p>
                <button type="button" onClick={scrollToProducts}>
                  Khám phá ngay
                  <ChevronRight size={18} />
                </button>
                <div className="hero-note">
                  <strong>HDX TECH</strong>
                  <span>Technology for your lifestyle</span>
                </div>
              </div>
              <div className="hero-visual">
                <div className="hero-circle"></div>
                <div className="hero-product-card">
                  <span>HDX TECH COLLECTION</span>
                  <div className="hero-product-symbol">
                    <ShoppingBag size={58} />
                  </div>
                  <strong>TECHNOLOGY</strong>
                  <small>Upgrade your experience</small>
                </div>
              </div>
            </section>

            <section className="quick-benefits">
              <div>
                <Truck size={23} />
                <span>Giao hàng nhanh</span>
              </div>
              <div>
                <ShieldCheck size={23} />
                <span>Sản phẩm chính hãng</span>
              </div>
              <div>
                <Headphones size={23} />
                <span>Hỗ trợ tận tình</span>
              </div>
              <div>
                <ShoppingBag size={23} />
                <span>Thanh toán COD</span>
              </div>
            </section>

            <section className="category-section">
              <div className="block-heading">
                <div>
                  <span className="eyebrow">DANH MỤC</span>
                  <h2>Khám phá theo danh mục</h2>
                </div>
              </div>
              <div className="category-list">
                {categories.map((c, index) => (
                  <button
                    type="button"
                    key={c.category_id}
                    className="category-chip"
                    onClick={() => setFilter({ category: String(c.category_id) })}
                  >
                    <span className="category-number">{String(index + 1).padStart(2, "0")}</span>
                    {c.name} ({c.product_count})
                  </button>
                ))}
              </div>
            </section>

            {featured.length > 0 && (
              <section className="flash-section">
                <div className="flash-heading">
                  <div>
                    <span className="flash-label">
                      <Flame size={19} />
                      HDX TECH
                    </span>
                    <h2>Sản phẩm mới về</h2>
                    <p>Những sản phẩm vừa cập nhật tại HDX Tech.</p>
                  </div>
                </div>
                <div className="flash-product-grid">
                  {featured.map((product) => (
                    <ProductCard key={product.product_id} product={product} onAddToCart={(p) => add(p)} onViewDetail={setSelectedProduct} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <section className="shop-products" id="shop-products">
          <div className="block-heading">
            <div>
              <span className="eyebrow">HDX TECH STORE</span>
              <h2>
                {filters.q ? `Kết quả cho "${filters.q}"` : activeCategory ? activeCategory.name : "Tất cả sản phẩm"}
              </h2>
              <span className="product-count">Tìm thấy {products.length} sản phẩm</span>
            </div>
          </div>

          {/* Bộ lọc giá + sắp xếp */}
          <form
            className="filter-bar"
            onSubmit={(e) => {
              e.preventDefault();
              setFilter({ min: minPrice, max: maxPrice });
            }}
          >
            <SlidersHorizontal size={18} />
            <label>
              Giá từ
              <input type="number" min="0" step="10000" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" />
            </label>
            <label>
              đến
              <input type="number" min="0" step="10000" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Không giới hạn" />
            </label>
            <button type="submit" className="filter-apply">
              Lọc
            </button>
            <label className="filter-sort">
              Sắp xếp
              <select value={filters.sort} onChange={(e) => setFilter({ sort: e.target.value })}>
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="name">Tên A–Z</option>
              </select>
            </label>
            {hasFilter && (
              <button type="button" className="filter-clear" onClick={clearFilters}>
                Xóa bộ lọc
              </button>
            )}
          </form>

          {loading ? (
            <div className="empty-products">
              <ShoppingBag size={40} />
              <h3>Đang tải sản phẩm...</h3>
            </div>
          ) : error ? (
            <div className="empty-products">
              <ShoppingBag size={40} />
              <h3>Không thể tải sản phẩm</h3>
              <p>{error}</p>
              <button type="button" onClick={() => window.location.reload()}>
                Thử lại
              </button>
            </div>
          ) : products.length > 0 ? (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.product_id} product={product} onAddToCart={(p) => add(p)} onViewDetail={setSelectedProduct} />
              ))}
            </div>
          ) : (
            <div className="empty-products">
              <ShoppingBag size={40} />
              <h3>Không tìm thấy sản phẩm</h3>
              <p>Hãy thử từ khóa, danh mục hoặc khoảng giá khác.</p>
              <button type="button" onClick={clearFilters}>
                Xem tất cả sản phẩm
              </button>
            </div>
          )}
        </section>
      </div>

      {selectedProduct && <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </>
  );
}

export default HomePage;
