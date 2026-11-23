// Biểu đồ cột đơn giản bằng SVG (không cần thư viện) — dùng cho báo cáo thống kê (TV4)
import { useState } from "react";

const compact = (v) =>
  v >= 1e9 ? `${+(v / 1e9).toFixed(1)} tỷ` : v >= 1e6 ? `${+(v / 1e6).toFixed(1)} tr` : v >= 1e3 ? `${+(v / 1e3).toFixed(0)}k` : `${v}`;

/**
 * <BarChart data={[{ label: "01/11", value: 1200000 }]} format={formatMoney} />
 * horizontal: true -> cột nằm ngang (dùng cho top sản phẩm, nhãn dài)
 */
function BarChart({ data, format = String, horizontal = false, height = 260 }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(...data.map((d) => d.value), 0);

  if (data.length === 0 || max === 0) {
    return <div className="chart-empty">Không có dữ liệu trong khoảng thời gian này.</div>;
  }

  if (horizontal) {
    return (
      <div className="hbar-chart">
        {data.map((d) => (
          <div className="hbar-row" key={d.label} title={`${d.label}: ${format(d.value)}`}>
            <span className="hbar-label">{d.label}</span>
            <div className="hbar-track">
              <div className="hbar-fill" style={{ width: `${(d.value / max) * 100}%` }} />
            </div>
            <span className="hbar-value">{format(d.value)}</span>
          </div>
        ))}
      </div>
    );
  }

  const W = 760;
  const H = height;
  const pad = { top: 16, right: 12, bottom: 34, left: 52 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const step = innerW / data.length;
  const barW = Math.max(Math.min(step * 0.62, 46), 3);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const labelEvery = Math.ceil(data.length / 12); // tránh chữ chồng nhau

  return (
    <div className="bar-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Biểu đồ cột">
        {ticks.map((t) => {
          const y = pad.top + innerH - (t / max) * innerH;
          return (
            <g key={t}>
              <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} className="chart-grid" />
              <text x={pad.left - 8} y={y + 4} textAnchor="end" className="chart-tick">
                {compact(Math.round(t))}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const h = (d.value / max) * innerH;
          const x = pad.left + i * step + (step - barW) / 2;
          return (
            <g key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={pad.left + i * step} y={pad.top} width={step} height={innerH} fill="transparent" />
              <rect x={x} y={pad.top + innerH - h} width={barW} height={Math.max(h, d.value ? 1 : 0)} rx="3" className={hover === i ? "chart-bar active" : "chart-bar"} />
              {i % labelEvery === 0 && (
                <text x={x + barW / 2} y={H - 12} textAnchor="middle" className="chart-tick">
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div className="chart-tooltip">
          <strong>{data[hover].label}</strong>
          <span>{format(data[hover].value)}</span>
          {data[hover].extra && <small>{data[hover].extra}</small>}
        </div>
      )}
    </div>
  );
}

export default BarChart;
