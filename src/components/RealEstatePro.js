// src/components/RealEstatePro.js
import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function RealEstatePro({ data }) {
  const commercial = data?.commercial || [];
  const office = data?.office || [];

  // ✅ Always run hooks first
  const merged = useMemo(() => {
    const months = [
      ...new Set([
        ...commercial.map((d) => d.yearMonth),
        ...office.map((d) => d.yearMonth),
      ]),
    ].sort();

    return months.map((m) => ({
      yearMonth: m,
      COMMERCIAL:
        commercial.find((d) => d.yearMonth === m)?.medianPricePerSqm || null,
      OFFICE:
        office.find((d) => d.yearMonth === m)?.medianPricePerSqm || null,
    }));
  }, [commercial, office]);

  // ✅ Only after hooks, we check if there’s no data
  if (!data || (!commercial.length && !office.length)) {
    return <p className="muted">No real estate data available.</p>;
  }

  return (
    <div className="card chart-card">
      <div className="card-title">Real Estate Trends (₩/㎡)</div>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={merged}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="yearMonth"
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(val) =>
              new Intl.NumberFormat("ko-KR").format(val) + " ₩/㎡"
            }
            labelFormatter={(label) => `Month: ${label}`}
            contentStyle={{
              background: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "6px",
              color: "#e5e7eb",
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="COMMERCIAL" stroke="#3b82f6" dot={false} />
          <Line type="monotone" dataKey="OFFICE" stroke="#22d3ee" dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <div className="muted" style={{ marginTop: "6px" }}>
        Showing commercial vs office median prices per ㎡ over time.
      </div>
    </div>
  );
}
