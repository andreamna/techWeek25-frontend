// src/components/DemographicsPro.js
import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Legend,
  CartesianGrid,
  Cell
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
    data.forEach((d) => { m += d.male; f += d.female; });
    return { m, f };
  }, [data]);

  const topAge = data.reduce(
    (a, b) => (a.male + a.female > b.male + b.female ? a : b),
    {}
  );

  if (!visitors) {
    return <p className="muted">No demographics data available.</p>;
  }

  return (
    <div className="dash">
      {/* KPI row */}
      <div className="cards">
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

      {/* Gender Split */}
      <div className="card chart-card">
        <div className="card-title">Gender Split</div>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <defs>
              <linearGradient id="maleGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.8}/>
              </linearGradient>
              <linearGradient id="femaleGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#f472b6" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
            <Pie
              data={[
                { name: "Male", value: totals.m },
                { name: "Female", value: totals.f },
              ]}
              dataKey="value"
              outerRadius={90}
              label={false}
            >
              <Cell fill="url(#maleGrad)" />
              <Cell fill="url(#femaleGrad)" />
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid rgba(148,163,184,0.2)",
                borderRadius: "8px",
                color: "#e5e7eb",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Age Distribution */}
      <div className="card chart-card">
        <div className="card-title">Age Distribution</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 40, right: 20 }}
            barCategoryGap={20}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              type="number"
              tick={{ fill: "#e5e7eb", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="age"
              tick={{ fill: "#e5e7eb", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid rgba(148,163,184,0.2)",
                borderRadius: "8px",
                color: "#e5e7eb",
              }}
            />
            <Bar dataKey="male" name="Male" radius={[6, 6, 6, 6]} fill="url(#maleGrad)" />
            <Bar dataKey="female" name="Female" radius={[6, 6, 6, 6]} fill="url(#femaleGrad)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
