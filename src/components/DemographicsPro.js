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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, p) => sum + p.value, 0);
      return (
        <div style={{
          background: "#1f2937",
          border: "1px solid #374151",
          borderRadius: "8px",
          padding: "8px 12px",
          color: "#e5e7eb"
        }}>
          <p style={{ margin: 0, fontWeight: 600, marginBottom: 6 }}>
            {payload[0].payload.age ? `Age ${payload[0].payload.age}` : payload[0].name}
          </p>
          {payload.map((p, i) => (
            <p key={i} style={{ margin: "2px 0", color: p.color }}>
              {p.name}: {Math.round(p.value)} ({((p.value/total)*100).toFixed(1)}%)
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!visitors) {
    return <p className="muted">No demographics data available.</p>;
  }

  const isMobile = window.innerWidth < 768;

  return (
    <div className="dash demographics-section">
      {/* KPI row */}
      <div className="cards demographics-metrics">
        <div className="card glass metric">
          <div className="metric-label">Female Visitors</div>
          <div className="metric-value">
            {((totals.f / (totals.f + totals.m)) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="card glass metric">
          <div className="metric-label">Male Visitors</div>
          <div className="metric-value">
            {((totals.m / (totals.f + totals.m)) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="card glass metric">
          <div className="metric-label">Top Age Group</div>
          <div className="metric-value">{topAge.age}</div>
        </div>
      </div>

      {/* Gender Split */}
      <div className="card chart-card">
        <div className="card-title">Gender Distribution</div>
        <ResponsiveContainer width="100%" height={isMobile ? 220 : 280}>
          <PieChart>
            <defs>
              <linearGradient id="maleGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.85} />
              </linearGradient>
              <linearGradient id="femaleGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ec4899" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#f472b6" stopOpacity={0.85} />
              </linearGradient>
            </defs>
            <Pie
              data={[
                { name: "Male", value: totals.m },
                { name: "Female", value: totals.f },
              ]}
              dataKey="value"
              outerRadius={isMobile ? 75 : 95}
              label={({name, percent}) => `${name} ${(percent * 100).toFixed(1)}%`}
              labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
            >
              <Cell fill="url(#maleGrad)" />
              <Cell fill="url(#femaleGrad)" />
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {!isMobile && <Legend 
              verticalAlign="bottom" 
              iconType="circle"
              wrapperStyle={{ paddingTop: 10 }}
            />}
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Age Distribution */}
      <div className="card chart-card">
        <div className="card-title">Age Distribution by Gender</div>
        <ResponsiveContainer width="100%" height={isMobile ? 240 : 280}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: isMobile ? 25 : 45, right: isMobile ? 10 : 20, top: 10, bottom: 0 }}
            barCategoryGap={isMobile ? 12 : 18}
          >
            <CartesianGrid stroke="#374151" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: "#94a3b8", fontSize: isMobile ? 11 : 12 }}
              axisLine={{ stroke: "#374151" }}
            />
            <YAxis
              type="category"
              dataKey="age"
              tick={{ fill: "#94a3b8", fontSize: isMobile ? 11 : 12 }}
              axisLine={{ stroke: "#374151" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              iconType="circle"
              wrapperStyle={{ paddingTop: 10, fontSize: isMobile ? 12 : 13 }}
            />
            <Bar dataKey="male" fill="url(#maleGrad)" radius={[0, 8, 8, 0]} name="Male" />
            <Bar dataKey="female" fill="url(#femaleGrad)" radius={[0, 8, 8, 0]} name="Female" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
