import React, { useMemo, useState } from "react";
import { useSwipeable } from "react-swipeable";
import Dashboard from "./Dashboard";
import FloatingPro from "./FloatingPro";
import DemographicsPro from "./DemographicsPro";
import RealEstatePro from "./RealEstatePro";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import "../App.css";

export default function DataTabs({ businessData, floatingData, realEstateData, loading }) {
  const [activeTab, setActiveTab] = useState(0);
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setActiveTab((p) => Math.min(p + 1, 4)),
    onSwipedRight: () => setActiveTab((p) => Math.max(p - 1, 0)),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const handleTabClick = (index) => {
    if (index === 1) {
      if (!businessData || !businessData.totalCount || !businessData.categoryCounts) {
        window.alert("We are sorry, we are having some problems with our data source.");
        return;
      }
    }
    setActiveTab(index);
  };

  /* ===== Competition Score Calculations ===== */
  const score = businessData?.competitionScore ?? 0;
  const totalBusinesses = businessData?.totalCount ?? 0;

  const trafficFactor = useMemo(() => {
    const wr = businessData?.congestionData?.weeklyRhythm || {};
    const vals = Object.values(wr);
    if (!vals.length) return 50;
    return Math.max(0, Math.min(100, vals.reduce((a, b) => a + b, 0) / vals.length));
  }, [businessData]);

  const densityFactor = useMemo(() => {
    if (totalBusinesses <= 0) return 70;
    if (totalBusinesses < 20) return 60;
    if (totalBusinesses < 50) return 45;
    if (totalBusinesses < 100) return 35;
    return 25;
  }, [totalBusinesses]);

  const demoFactor = useMemo(() => {
    const v = businessData?.visitorsDistribution || {};
    const seniors = (v.male_60 || 0) + (v.female_60 || 0) + (v.male_70_over || 0) + (v.female_70_over || 0);
    const all = Object.values(v).reduce((a, b) => a + b, 0) || 1;
    const pct = (seniors / all) * 100;
    return Math.max(20, 70 - Math.max(0, pct - 40));
  }, [businessData]);

  const rentFactor = 50;

  const breakdown = [
    { name: "Foot Traffic", value: Math.round(trafficFactor) },
    { name: "Business Density", value: Math.round(densityFactor) },
    { name: "Demographics Fit", value: Math.round(demoFactor) },
    { name: "Rent (est.)", value: rentFactor },
  ];

  const donut = [
    { name: "Score", value: score },
    { name: "Remaining", value: 100 - score }
  ];

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
            {payload[0].name}
          </p>
          <p style={{ margin: 0, color: "#60a5fa", fontSize: 15, fontWeight: 600 }}>
            {Math.round(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="data-tabs" {...swipeHandlers}>
      {loading ? (
        <div className="loading-panel">
          <div className="spinner"></div>
          <p style={{ fontSize: 15, color: "#94a3b8", marginTop: 8 }}>Loading data, please wait...</p>
        </div>
      ) : (
        <>
          <div className="tab-header">
            {["Competition", "Businesses", "Floating Pop.", "Demographics", "Real Estate"].map((t, i) => (
              <button
                key={t}
                className={activeTab === i ? "active" : ""}
                onClick={() => handleTabClick(i)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 0 && (
              <div className="dash">
                {/* Competition Index - Full Width */}
                <div className="card chart-card">
                  <div className="card-title">Competition Index</div>
                  <div className="gauge-container">
                    <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
                      <PieChart>
                        <defs>
                          <linearGradient id="donutGrad" x1="0" x2="1" y1="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.9} />
                          </linearGradient>
                        </defs>
                        <Pie
                          data={donut}
                          dataKey="value"
                          startAngle={180}
                          endAngle={0}
                          innerRadius={isMobile ? 60 : 85}
                          outerRadius={isMobile ? 90 : 120}
                          stroke="none"
                        >
                          <Cell key="score" fill="url(#donutGrad)" />
                          <Cell key="remain" fill="rgba(148, 163, 184, 0.1)" />
                        </Pie>
                        <Tooltip
                          formatter={(value) => [Math.round(value), "Score"]}
                          contentStyle={{
                            background: "rgba(15, 23, 42, 0.95)",
                            border: "1px solid rgba(59, 130, 246, 0.3)",
                            color: "#f1f5f9",
                            borderRadius: "12px",
                            fontSize: 14,
                            fontWeight: 600
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="gauge-score">{score}</div>
                    <div className="gauge-label">
                      out of 100<br />
                      {businessData?.scoreType === "Tailored"
                        ? "Tailored Feasibility Index"
                        : "General Feasibility Index"}
                    </div>
                  </div>
                </div>

                {/* Score Breakdown - Full Width */}
                <div className="card chart-card">
                  <div className="card-title">Score Breakdown</div>
                  <ResponsiveContainer width="100%" height={isMobile ? 260 : 320}>
                    <BarChart
                      data={breakdown}
                      layout="vertical"
                      margin={{ left: isMobile ? 16 : 24, right: isMobile ? 12 : 24, top: 16, bottom: 16 }}
                      barCategoryGap={isMobile ? 14 : 20}
                    >
                      <defs>
                        <linearGradient id="barGrad" x1="0" x2="1" y1="0" y2="0">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.9} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(148, 163, 184, 0.1)" vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tick={{ fill: "#94a3b8", fontSize: isMobile ? 12 : 13 }}
                        axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }}
                        tickFormatter={(value) => `${value}`}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={isMobile ? 130 : 160}
                        tick={{ fill: "#f1f5f9", fontSize: isMobile ? 13 : 14, fontWeight: 600 }}
                        axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59, 130, 246, 0.05)" }} />
                      <Bar dataKey="value" fill="url(#barGrad)" radius={[0, 10, 10, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="muted" style={{ marginTop: 16, textAlign: 'center', lineHeight: 1.6 }}>
                    Traffic increases score; high density and rent decrease it
                  </div>
                </div>
              </div>
            )}
            {activeTab === 1 && <Dashboard data={businessData} />}
            {activeTab === 2 && <FloatingPro data={floatingData} />}
            {activeTab === 3 && <DemographicsPro visitors={businessData?.visitorsDistribution} />}
            {activeTab === 4 && <RealEstatePro data={realEstateData} />}
          </div>
        </>
      )}
    </div>
  );
}
