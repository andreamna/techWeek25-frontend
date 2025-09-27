// src/components/DemographicsPro.js
import React, { useMemo } from "react";
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

export default function DemographicsPro({ visitors }) {
  const ages = ["0", "10", "20", "30", "40", "50", "60", "70_over"];
  const data = ages.map((a) => ({
    age: a.replace("_over", "+"),
    male: Number(visitors?.[`male_${a}`] || 0),
    female: Number(visitors?.[`female_${a}`] || 0),
  }));

  const totals = useMemo(() => {
    let m = 0, f = 0;
    data.forEach((d) => {
      m += d.male;
      f += d.female;
    });
    return { m, f };
  }, [data]);

  const topAge = data.reduce(
    (a, b) => (a.male + a.female > b.male + b.female ? a : b),
    {}
  );

  if (!visitors) {
    return <p className="muted">No demographics data available.</p>;
  }

  const isMobile = window.innerWidth < 768;

  return (
    <div className="dash demographics-section">
      {/* KPI row */}
      <div className="cards demographics-metrics">
        <div className="card glass metric">
          <div className="metric-label">Female</div>
          <div className="metric-value">
            {((totals.f / (totals.f + totals.m)) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="card glass metric">
          <div className="metric-label">Male</div>
          <div className="metric-value">
            {((totals.m / (totals.f + totals.m)) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="card glass metric">
          <div className="metric-label">Top Age Band</div>
          <div className="metric-value">{topAge.age}</div>
        </div>
      </div>

      {/* Gender Split (top) */}
      <div className="card chart-card">
        <div className="card-title">Gender Split</div>
        <ResponsiveContainer width="100%" height={isMobile ? 200 : 260}>
          <PieChart>
            <defs>
              <linearGradient id="maleGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="femaleGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ec4899" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#f472b6" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <Pie
              data={[
                { name: "Male", value: totals.m },
                { name: "Female", value: totals.f },
              ]}
              dataKey="value"
              outerRadius={isMobile ? 70 : 90}
              label={false}
            >
              <Cell fill="url(#maleGrad)" />
              <Cell fill="url(#femaleGrad)" />
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#e5e7eb",
                fontSize: isMobile ? 12 : 14,
              }}
            />
            {!isMobile && <Legend />}
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Age Distribution (below) */}
      <div className="card chart-card">
        <div className="card-title">Age Distribution</div>
        <ResponsiveContainer width="100%" height={isMobile ? 220 : 260}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: isMobile ? 20 : 40, right: 20 }}
            barCategoryGap={isMobile ? 12 : 20}
          >
            <CartesianGrid stroke="#1e293b" />
            <XAxis
              type="number"
              tick={{ fill: "#e5e7eb", fontSize: isMobile ? 11 : 12 }}
            />
            <YAxis
              type="category"
              dataKey="age"
              tick={{ fill: "#e5e7eb", fontSize: isMobile ? 11 : 12 }}
            />
            <Tooltip
              contentStyle={{
                background: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#e5e7eb",
                fontSize: isMobile ? 12 : 14,
              }}
            />
            <Bar dataKey="male" fill="url(#maleGrad)" radius={[6, 6, 6, 6]} />
            <Bar dataKey="female" fill="url(#femaleGrad)" radius={[6, 6, 6, 6]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
