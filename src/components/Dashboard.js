// components/Dashboard.js
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
} from "recharts";

const BAR_COLORS = ["#22d3ee", "#3b82f6", "#3DDC97", "#facc15", "#f97316"];
const PIE_COLORS = ["#22d3ee", "#3b82f6", "#3DDC97", "#facc15", "#f97316"];

function Dashboard({ data }) {
  const [showAll, setShowAll] = useState(false);
  const [chartType, setChartType] = useState("bar"); // toggle bar/pie

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

  return (
    <section className="dash">
      <div className="cards">
        {/* Metric Card */}
        <div className="card glass metric">
          <div className="metric-label">Total Businesses</div>
          <div className="metric-value">{total.toLocaleString()}</div>

          {/* Spark mini bar */}
          <div className="spark">
            <ResponsiveContainer width="100%" height={50}>
              <BarChart data={top5}>
                <Bar
                  dataKey="value"
                  fill="#3b82f6"
                  radius={[3, 3, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart Card */}
        <div className="card glass">
          <div className="card-title">
            Top 5 Categories
            <button
              onClick={() =>
                setChartType((prev) => (prev === "bar" ? "pie" : "bar"))
              }
              className="btn-ghost"
              style={{ marginLeft: "10px" }}
            >
              Switch to {chartType === "bar" ? "Pie" : "Bar"}
            </button>
          </div>

          {top5.length > 0 ? (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={280}>
                {chartType === "bar" ? (
                  <BarChart
                    data={top5}
                    layout="vertical"
                    margin={{ left: 40, right: 20 }}
                  >
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={120}
                      tick={{ fontSize: 13, fill: "#e5e7eb" }}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={true}
                      animationDuration={800}
                    >
                      {top5.map((_, i) => (
                        <Cell
                          key={`bar-${i}`}
                          fill={BAR_COLORS[i % BAR_COLORS.length]}
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
                      outerRadius={90}
                      label
                    >
                      {top5.map((_, i) => (
                        <Cell
                          key={`cell-${i}`}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="muted">No category data yet.</p>
          )}
        </div>
      </div>

      {/* Full List */}
      <div className="card glass">
        <button className="btn-ghost" onClick={() => setShowAll((s) => !s)}>
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
    </section>
  );
}

export default Dashboard;
