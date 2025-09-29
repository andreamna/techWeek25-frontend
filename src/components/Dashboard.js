import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
  CartesianGrid,
} from "recharts";

const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899"];

function Dashboard({ data }) {
  const [showAll, setShowAll] = useState(false);
  const [chartType, setChartType] = useState("bar");

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const total = data?.totalCount ?? 0;
  const categories = data?.categoryCounts ?? {};

  const sorted = useMemo(
    () => Object.entries(categories).sort((a, b) => b[1] - a[1]),
    [categories]
  );

  const top5 = useMemo(
    () => sorted.slice(0, 5).map(([name, value]) => ({ name, value })),
    [sorted]
  );

  const mostCommon = top5.length > 0 ? top5[0].name : "-";
  const avgPerCategory = sorted.length > 0 ? Math.round(total / sorted.length) : 0;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: "rgba(15, 23, 42, 0.95)",
          border: "1px solid rgba(59, 130, 246, 0.3)",
          borderRadius: "12px",
          padding: "12px 16px",
          color: "#f1f5f9",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)"
        }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
            {payload[0].payload.name || payload[0].name}
          </p>
          <p style={{ margin: 0, color: "#60a5fa", fontSize: 15, fontWeight: 600 }}>
            {payload[0].value.toLocaleString()} businesses
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dash">
      {/* KPI Cards */}
      <div className="cards">
        <div className="card glass metric">
          <div className="metric-label">Total Businesses</div>
          <div className="metric-value">{total.toLocaleString()}</div>
        </div>
        <div className="card glass metric">
          <div className="metric-label">Most Common</div>
          <div className="metric-value" style={{ fontSize: isMobile ? "20px" : "24px" }}>
            {mostCommon}
          </div>
        </div>
        <div className="card glass metric">
          <div className="metric-label">Avg per Category</div>
          <div className="metric-value">{avgPerCategory}</div>
        </div>
      </div>

      {/* Top 5 Chart */}
      <div className="card chart-card">
        <div className="card-title">
          Top 5 Categories
          <button
            onClick={() => setChartType((p) => (p === "bar" ? "pie" : "bar"))}
            className="btn-ghost"
          >
            Switch to {chartType === "bar" ? "Pie" : "Bar"}
          </button>
        </div>

        {top5.length > 0 ? (
          <ResponsiveContainer width="100%" height={isMobile ? 280 : 340}>
            {chartType === "bar" ? (
              <BarChart
                data={top5}
                layout="vertical"
                margin={{ left: isMobile ? 16 : 24, right: isMobile ? 12 : 24, top: 16, bottom: 16 }}
                barCategoryGap={isMobile ? 14 : 20}
              >
                <CartesianGrid stroke="rgba(148, 163, 184, 0.1)" horizontal={false} />
                <XAxis 
                  type="number" 
                  tick={{ fill: "#94a3b8", fontSize: isMobile ? 12 : 13 }}
                  axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={isMobile ? 110 : 140}
                  tick={{ fill: "#f1f5f9", fontSize: isMobile ? 12 : 13, fontWeight: 600 }}
                  axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59, 130, 246, 0.05)" }} />
                <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                  {top5.map((_, i) => (
                    <Cell
                      key={`bar-${i}`}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={top5}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={isMobile ? 90 : 110}
                  label={({ name, percent }) => 
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                >
                  {top5.map((_, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                {!isMobile && (
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: 16, fontSize: 13 }}
                  />
                )}
              </PieChart>
            )}
          </ResponsiveContainer>
        ) : (
          <p className="muted" style={{ textAlign: "center", padding: "40px 0" }}>
            No category data available yet
          </p>
        )}
      </div>

      {/* Full List */}
      <div className="card">
        <button
          className="btn-ghost"
          onClick={() => setShowAll((s) => !s)}
          style={{ width: "100%" }}
        >
          {showAll ? "Hide full list" : "Show full list"}
        </button>
        {showAll && (
          <div className="list-wrap">
            <ul className="kv">
              {sorted.map(([name, value]) => (
                <li key={name}>
                  <span>{name}</span>
                  <b>{value.toLocaleString()}</b>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;