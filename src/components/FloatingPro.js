// src/components/FloatingPro.js
import React, { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

/** Expects prop:
 * data = {
 *   weeklyRhythm: { MON: number, ..., SUN: number },
 *   hourlyBreakdown: { MON: number[24], ..., SUN: number[24] }
 * }
 */
export default function FloatingPro({ data }) {
  const [series, setSeries] = useState("all"); // 'all' | 'weekday' | 'weekend'
  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 768;

  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const weeklyRhythm = data?.weeklyRhythm || {};
  const hourlyBreakdown = data?.hourlyBreakdown || {};

  // Consistent per-day colors (matches your theme)
  const DAY_COLORS = {
    MON: "#3b82f6",
    TUE: "#8b5cf6",
    WED: "#ec4899",
    THU: "#f59e0b",
    FRI: "#10b981",
    SAT: "#06b6d4",
    SUN: "#ef4444",
  };

  // Gradient interpolation: blue → purple → pink
  const interpolateColor = (intensity) => {
    const low = [59, 130, 246];   // blue (#3b82f6)
    const mid = [139, 92, 246];   // purple (#8b5cf6)
    const high = [236, 72, 153];  // pink (#ec4899)

    let r, g, b;
    if (intensity <= 0.5) {
      const t = intensity / 0.5;
      r = low[0] + t * (mid[0] - low[0]);
      g = low[1] + t * (mid[1] - low[1]);
      b = low[2] + t * (mid[2] - low[2]);
    } else {
      const t = (intensity - 0.5) / 0.5;
      r = mid[0] + t * (high[0] - mid[0]);
      g = mid[1] + t * (high[1] - mid[1]);
      b = mid[2] + t * (high[2] - mid[2]);
    }
    return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},0.9)`; 
  };

  /* ===== Weekly summary ===== */
  const weekly = days.map((d) => ({
    day: d,
    value: Math.round(Number(weeklyRhythm[d] || 0)),
  }));
  const busiestDay = weekly.reduce(
    (a, b) => (b.value > a.value ? b : a),
    { value: -Infinity }
  );

  /* ===== Hourly series (weekday/weekend averages) ===== */
  const avgFor = (subset) => {
    const totals = Array(24).fill(0);
    const counts = Array(24).fill(0);
    subset.forEach((d) =>
      (hourlyBreakdown[d] || []).forEach((v, i) => {
        totals[i] += v;
        counts[i] += 1;
      })
    );
    return totals.map((s, i) => (counts[i] ? s / counts[i] : 0));
  };
  const weekdayAvg = avgFor(["MON", "TUE", "WED", "THU", "FRI"]);
  const weekendAvg = avgFor(["SAT", "SUN"]);

  const hourlyAll = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${String(i).padStart(2, "0")}:00`,
      weekday: Math.round(weekdayAvg[i] || 0),
      weekend: Math.round(weekendAvg[i] || 0),
      all: Math.round(
        (weekdayAvg[i] || 0) * (5 / 7) + (weekendAvg[i] || 0) * (2 / 7)
      ),
    }));
  }, [weekdayAvg, weekendAvg]);

  const peakIdx = hourlyAll.reduce(
    (m, _, i) => (hourlyAll[i].all > hourlyAll[m].all ? i : m),
    0
  );
  const peakHour = hourlyAll[peakIdx]?.hour || "18:00";
  const avgDaily = Math.round(
    weekly.reduce((a, b) => a + b.value, 0) / (weekly.length || 1)
  );

  const activeKey =
    series === "all" ? "all" : series === "weekday" ? "weekday" : "weekend";
  const seriesLabel =
    series === "all" ? "All Days" : series === "weekday" ? "Weekday" : "Weekend";

  /* ===== Heatmap (2-hour blocks × 7 days) ===== */
  const blocks = Array.from({ length: 12 }, (_, i) => {
    const s = i * 2;
    const e = s + 2;
    return `${String(s).padStart(2, "0")}-${String(e).padStart(2, "0")}`;
  });

  const heatmap = days.flatMap((d) => {
    const arr = hourlyBreakdown[d] || [];
    return blocks.map((b, idx) => {
      const s = idx * 2,
        e = s + 2;
      const avg =
        arr.slice(s, e).reduce((a, v) => a + Number(v || 0), 0) / 2 || 0;
      return { day: d, block: b, value: avg };
    });
  });

  const maxHeat = Math.max(1, ...heatmap.map((h) => h.value));

  /* ===== Shared tooltip (rounded values, consistent style) ===== */
  const DarkTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0];
    return (
      <div
        style={{
          background: "rgba(15,23,42,0.95)",
          border: "1px solid rgba(59,130,246,0.3)",
          borderRadius: 12,
          padding: "10px 12px",
          color: "#f1f5f9",
          fontSize: 13,
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 4 }}>
          {p.payload.hour || p.payload.day}
        </div>
        <div style={{ color: "#60a5fa", fontWeight: 600 }}>
          {Math.round(p.value)}
        </div>
      </div>
    );
  };

  /* ===== Empty state ===== */
  if (!data) {
    return (
      <div className="card glass" style={{ padding: 24, textAlign: "center" }}>
        <p className="muted">No floating population data available.</p>
      </div>
    );
  }

  return (
    <div className="dash">
      {/* KPI row */}
      <div className="cards">
        <div className="card glass metric">
          <div className="metric-label">Busiest Day</div>
          <div className="metric-value" style={{ fontSize: isMobile ? 24 : 32 }}>
            {busiestDay.day}
          </div>
          <div className="muted">Avg {busiestDay.value}</div>
        </div>
        <div className="card glass metric">
          <div className="metric-label">Peak Hour</div>
          <div className="metric-value" style={{ fontSize: isMobile ? 24 : 32 }}>
            {peakHour}
          </div>
          <div className="muted">Highest hourly avg</div>
        </div>
        <div className="card glass metric">
          <div className="metric-label">Avg Daily Visitors</div>
          <div className="metric-value">{avgDaily}</div>
          <div className="muted">Index (0–100)</div>
        </div>
      </div>

      {/* Hourly area chart */}
      <div className="card chart-card">
        <div className="card-title">
          Hourly Trend • {seriesLabel}
        </div>
        <div className="pills" style={{ marginBottom: 8 }}>
          {["all", "weekday", "weekend"].map((p) => (
            <button
              key={p}
              className={`pill ${series === p ? "active" : ""}`}
              onClick={() => setSeries(p)}
            >
              {p === "all" ? "All Days" : p === "weekday" ? "Weekday" : "Weekend"}
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={isMobile ? 180 : 240}>
          <AreaChart
            data={hourlyAll}
            margin={{
              left: isMobile ? 8 : 16,
              right: isMobile ? 8 : 16,
              top: 8,
              bottom: 8,
            }}
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.06} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148,163,184,0.15)"
              vertical={false}
            />
            <XAxis
              dataKey="hour"
              interval={isMobile ? 3 : 2}
              tick={{ fontSize: isMobile ? 10 : 12, fill: "#94a3b8" }}
              axisLine={{ stroke: "rgba(148,163,184,0.25)" }}
              allowDataOverflow={false}
            />
            <YAxis
              tick={{ fontSize: isMobile ? 11 : 12, fill: "#94a3b8" }}
              axisLine={{ stroke: "rgba(148,163,184,0.25)" }}
              tickFormatter={(v) => Math.round(v)}
            />
            <Tooltip content={<DarkTooltip />} />
            <Area
              type="monotone"
              dataKey={activeKey}
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#areaGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly bars */}
      <div className="card chart-card">
        <div className="card-title">Weekly Traffic</div>
        <ResponsiveContainer width="100%" height={isMobile ? 220 : 240}>
          <BarChart
            data={weekly}
            margin={{ left: isMobile ? 8 : 16, top: 8, right: isMobile ? 8 : 16, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148,163,184,0.15)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fontSize: isMobile ? 12 : 13, fill: "#e5e7eb", fontWeight: 600 }}
              axisLine={{ stroke: "rgba(148,163,184,0.25)" }}
            />
            <YAxis
              tick={{ fontSize: isMobile ? 11 : 12, fill: "#94a3b8" }}
              axisLine={{ stroke: "rgba(148,163,184,0.25)" }}
              tickFormatter={(v) => Math.round(v)}
            />
            <Tooltip content={<DarkTooltip />} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {weekly.map((row, i) => (
                <Cell key={row.day} fill={DAY_COLORS[row.day]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Heatmap */}
      <div className="card chart-card">
        <div className="card-title">Traffic Intensity (2-hour blocks)</div>

        <div className="heatmap-wrap">
          <div
            className="heatmap-grid"
            style={{
              padding: isMobile ? "0 8px" : "0 16px",
              gridTemplateColumns: isMobile
                ? "35px repeat(12, 1fr)"
                : "70px repeat(12, 1fr)",
            }}
          >
            {/* top header row */}
            <div />
            {blocks.map((b) => (
              <div key={b} className="heatmap-h" style={{ fontSize: isMobile ? 10 : 12 }}>
                {b}
              </div>
            ))}

            {/* rows */}
            {days.map((d) => (
              <React.Fragment key={d}>
                <div className="heatmap-r" style={{ fontWeight: 600 }}>
                  {d}
                </div>
                {blocks.map((b) => {
                  const v =
                    heatmap.find((x) => x.day === d && x.block === b)?.value || 0;
                  const intensity = Math.min(1, v / maxHeat); // 0–1
                  return (
                    <div
                      key={`${d}-${b}`}
                      className="heat-cell"
                      title={`${d} ${b}: ${Math.round(v)}`}
                      style={{
                        background: interpolateColor(intensity),
                        borderRadius: 3,
                        height: isMobile ? 12 : 18,
                        transition: "background 0.2s ease",
                      }}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div
  style={{
    marginTop: 12,
    textAlign: "center",
  }}
>
  <div
    style={{
      height: 10,
      borderRadius: 5,
      marginBottom: 6,
      background: "linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899)",
    }}
  />
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      fontSize: 12,
      color: "#94a3b8",
    }}
  >
    <span>Low</span>
    <span>Medium</span>
    <span>High</span>
  </div>
</div>

      </div>
    </div>
  );
}
