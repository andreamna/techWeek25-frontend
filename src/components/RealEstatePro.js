// src/components/RealEstatePro.js
import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function RealEstatePro({ data }) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const commercial = data?.commercial || [];

  // Process data - keep ALL data to show full trend
  const merged = useMemo(() => {
    // Group by year and take average for that year
    const yearMap = {};
    
    commercial.forEach(d => {
      const year = d.yearMonth.substring(0, 4);
      if (!yearMap[year]) {
        yearMap[year] = [];
      }
      yearMap[year].push(d.medianPricePerSqm || 0);
    });

    // Calculate average per year and sort
    return Object.keys(yearMap)
      .sort()
      .map(year => {
        const prices = yearMap[year];
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        return {
          year: year,
          commercial: Math.round(avgPrice),
        };
      });
  }, [commercial]);

  // Calculate statistics from last 5 years for better context
  const stats = useMemo(() => {
    if (merged.length === 0) {
      return { commercialLatest: 0, commercialAvg: 0, commercialTrend: 0 };
    }

    const recentData = merged.slice(-5); // Last 5 years
    const commercialValues = recentData.map(d => d.commercial);
    
    const commercialLatest = commercialValues[commercialValues.length - 1] || 0;
    const commercialEarliest = commercialValues[0] || commercialLatest;
    
    const commercialAvg = commercialValues.length 
      ? Math.round(commercialValues.reduce((a, b) => a + b, 0) / commercialValues.length)
      : 0;

    // Calculate trend from 5 years ago to now
    const commercialTrend = commercialEarliest 
      ? ((commercialLatest - commercialEarliest) / commercialEarliest * 100) 
      : 0;

    return {
      commercialLatest,
      commercialAvg,
      commercialTrend
    };
  }, [merged]);

  // Format currency
  const formatPrice = (value) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat("ko-KR").format(Math.round(value));
  };

  const formatPriceShort = (value) => {
    if (!value) return "0";
    const inMan = value / 10000;
    return inMan >= 1000 
      ? `${(inMan / 1000).toFixed(1)}억` 
      : `${Math.round(inMan)}만`;
  };

  // Custom tooltip
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
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, marginBottom: 8, color: "#94a3b8" }}>
            Year: {payload[0].payload.year}
          </p>
          <p style={{ 
            margin: "4px 0", 
            color: "#60a5fa",
            fontSize: 14,
            fontWeight: 600
          }}>
            Commercial: {formatPrice(payload[0].value)} ₩/㎡
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data || commercial.length === 0) {
    return (
      <div className="card" style={{ padding: "60px 20px", textAlign: "center" }}>
        <p className="muted">No real estate data available</p>
      </div>
    );
  }

  return (
    <div className="dash">
      {/* KPI Cards */}
      <div className="cards">
        <div className="card glass metric">
          <div className="metric-label">Current Price</div>
          <div className="metric-value" style={{ fontSize: isMobile ? "20px" : "28px" }}>
            {formatPriceShort(stats.commercialLatest)}
          </div>
          <div className="muted">{formatPrice(stats.commercialLatest)} ₩/㎡</div>
        </div>
        <div className="card glass metric">
          <div className="metric-label">5-Year Average</div>
          <div className="metric-value" style={{ fontSize: isMobile ? "20px" : "28px" }}>
            {formatPriceShort(stats.commercialAvg)}
          </div>
          <div className="muted">Recent average</div>
        </div>
        <div className="card glass metric">
          <div className="metric-label">5-Year Change</div>
          <div 
            className="metric-value" 
            style={{ 
              fontSize: isMobile ? "22px" : "32px",
              background: stats.commercialTrend >= 0 
                ? "linear-gradient(135deg, #10b981, #34d399)"
                : "linear-gradient(135deg, #ef4444, #f87171)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}
          >
            {stats.commercialTrend >= 0 ? "+" : ""}{stats.commercialTrend.toFixed(1)}%
          </div>
          <div className="muted">Price trend</div>
        </div>
      </div>

      {/* Price Trends Chart */}
      <div className="card chart-card">
        <div className="card-title">
          Real Estate Price Trends
          <span className="chart-subtitle">₩/㎡ over time</span>
        </div>

        <ResponsiveContainer width="100%" height={isMobile ? 280 : 380}>
          <AreaChart 
            data={merged}
            margin={{ left: isMobile ? 0 : 10, right: isMobile ? 10 : 20, top: 16, bottom: 16 }}
          >
            <defs>
              <linearGradient id="commercialGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
            
            <XAxis
              dataKey="year"
              tick={{ fontSize: isMobile ? 11 : 12, fill: "#94a3b8" }}
              axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }}
              interval="preserveStartEnd"
            />
            
            <YAxis
              tickFormatter={(v) => formatPriceShort(v)}
              tick={{ fontSize: isMobile ? 11 : 12, fill: "#94a3b8" }}
              axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }}
              width={isMobile ? 50 : 65}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey="commercial"
              name="Commercial"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#commercialGrad)"
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="muted" style={{ marginTop: 16, lineHeight: 1.6, textAlign: "center" }}>
          Median prices per square meter (㎡) for commercial real estate
        </div>
      </div>
    </div>
  );
}