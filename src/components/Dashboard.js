//Dashboard.js
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
const PIE_COLORS = BAR_COLORS;

function Dashboard({ data }) {
  const [showAll, setShowAll] = useState(false);
  const [chartType, setChartType] = useState("bar");

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
        {/* KPI */}
        <div className="card glass metric">
          <div className="metric-label">Total Businesses</div>
          <div className="metric-value">{total.toLocaleString()}</div>
        </div>

        <div className="card glass">
          <div className="card-title">
            Top 5 Categories
            <button
              onClick={() =>
                setChartType((p) => (p === "bar" ? "pie" : "bar"))
              }
              className="btn-ghost"
            >
              Switch to {chartType === "bar" ? "Pie" : "Bar"}
            </button>
          </div>

          {top5.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              {chartType === "bar" ? (
                <BarChart
                  data={top5}
                  layout="vertical"
                  margin={{ left: 40, right: 20 }}
                >
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
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
          ) : (
            <p className="muted">No category data yet.</p>
          )}
        </div>
      </div>

      {/* List */}
      <div className="card glass">
        <button
          className="btn-ghost"
          onClick={() => setShowAll((s) => !s)}
        >
          {showAll ? "Hide full list" : "Show full list"}
        </button>
        {showAll && (
          <ul className="kv">
            {sorted.map(([name, value]) => (
              <li key={name}>
                <span>{name}</span>
                <b>{value.toLocaleString()}</b>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default Dashboard;
