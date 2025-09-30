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

  const getScoreColor = (scoreValue) => {
    if (scoreValue < 50) return "#ec4899";
    if (scoreValue < 70) return "#3b82f6";
    return "#8b5cf6";
  };

  const getScoreStatus = (scoreValue) => {
    if (scoreValue < 50) return { text: "Not Recommended", emoji: "❌", bg: "rgba(236, 72, 153, 0.1)" };
    if (scoreValue < 70) return { text: "Take Your Own Risk", emoji: "⚠️", bg: "rgba(59, 130, 246, 0.1)" };
    return { text: "Recommended", emoji: "✅", bg: "rgba(139, 92, 246, 0.1)" };
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: "rgba(15, 23, 42, 0.98)",
          border: "1px solid rgba(59, 130, 246, 0.3)",
          borderRadius: "12px",
          padding: "12px 16px",
          color: "#f1f5f9",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)"
        }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 13, marginBottom: 4, color: "#94a3b8" }}>
            {payload[0].name}
          </p>
          <p style={{ margin: 0, color: "#60a5fa", fontSize: 18, fontWeight: 700 }}>
            {Math.round(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const status = getScoreStatus(score);

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
                {/* Competition Index Card - Enhanced */}
                <div className="card chart-card" style={{
                  background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)",
                  border: "1px solid rgba(71, 85, 105, 0.3)",
                  position: "relative",
                  overflow: "hidden"
                }}>
                  {/* Background gradient effect */}
                  <div style={{
                    position: "absolute",
                    top: "-50%",
                    right: "-50%",
                    width: "200%",
                    height: "200%",
                    background: `radial-gradient(circle, ${getScoreColor(score)}15 0%, transparent 70%)`,
                    pointerEvents: "none"
                  }}></div>

                  <div className="card-title" style={{ 
                    position: "relative", 
                    zIndex: 1,
                    fontSize: isMobile ? 18 : 20,
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${getScoreColor(score)}, ${getScoreColor(score)}dd)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    marginBottom: 8
                  }}>
                    Competition Index
                  </div>

                  <div className="gauge-container" style={{ position: "relative", zIndex: 1 }}>
                    <ResponsiveContainer width="100%" height={isMobile ? 240 : 320}>
                      <PieChart>
                        <defs>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                            <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>
                        <Pie
                          data={donut}
                          dataKey="value"
                          startAngle={180}
                          endAngle={0}
                          innerRadius={isMobile ? 70 : 95}
                          outerRadius={isMobile ? 100 : 135}
                          stroke="none"
                          filter="url(#glow)"
                        >
                          <Cell key="score" fill={getScoreColor(score)} />
                          <Cell key="remain" fill="rgba(148, 163, 184, 0.08)" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Enhanced Score Display */}
                    <div
                      className="gauge-score"
                      style={{
                        color: getScoreColor(score),
                        fontSize: isMobile ? 52 : 72,
                        fontWeight: 800,
                        textShadow: `0 0 30px ${getScoreColor(score)}50`,
                        letterSpacing: "-0.02em"
                      }}
                    >
                      {score}%
                    </div>

                    {/* Status Badge - More spacing from percentage */}
                    <div style={{
                      position: "absolute",
                      bottom: isMobile ? "10px" : "20px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      textAlign: "center",
                      width: "90%"
                    }}>
                      <div style={{
                        display: "inline-block",
                        background: `linear-gradient(135deg, ${status.bg}, ${getScoreColor(score)}08)`,
                        border: `1.5px solid ${getScoreColor(score)}50`,
                        borderRadius: "16px",
                        padding: isMobile ? "10px 18px" : "12px 28px",
                        marginBottom: 8,
                        boxShadow: `0 4px 20px ${getScoreColor(score)}20`
                      }}>
                        <div style={{
                          fontSize: isMobile ? 10 : 11,
                          color: "#94a3b8",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          marginBottom: 6
                        }}>
                          {businessData?.scoreType === "Tailored" ? "Tailored" : "General"} Feasibility
                        </div>
                        <div style={{
                          fontSize: isMobile ? 15 : 17,
                          color: getScoreColor(score),
                          fontWeight: 700,
                          letterSpacing: "-0.01em"
                        }}>
                          {status.emoji} {status.text}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown - Enhanced Text Display */}
                <div className="card chart-card" style={{
                  background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)",
                  border: "1px solid rgba(71, 85, 105, 0.3)",
                  padding: isMobile ? "20px" : "24px"
                }}>
                  <div className="card-title" style={{ 
                    marginBottom: "20px",
                    fontSize: isMobile ? 18 : 20,
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                  }}>
                    Score Breakdown
                  </div>

                  {businessData?.scoreType === "Tailored" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{
                        background: "rgba(59, 130, 246, 0.06)",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                        borderRadius: "12px",
                        padding: isMobile ? "14px 16px" : "16px 20px",
                        transition: "all 0.3s ease"
                      }}>
                        <div style={{ 
                          fontSize: isMobile ? 15 : 16, 
                          fontWeight: 700, 
                          color: "#60a5fa",
                          marginBottom: "6px",
                          letterSpacing: "-0.01em"
                        }}>
                          🚶 Foot Traffic <span style={{ color: "#64748b", fontWeight: 600 }}>(40%)</span>
                        </div>
                        <div style={{ fontSize: isMobile ? 13 : 14, color: "#cbd5e1", lineHeight: 1.6 }}>
                          People walking through the area, measuring customer flow.
                        </div>
                      </div>

                      <div style={{
                        background: "rgba(139, 92, 246, 0.06)",
                        border: "1px solid rgba(139, 92, 246, 0.2)",
                        borderRadius: "12px",
                        padding: isMobile ? "14px 16px" : "16px 20px",
                        transition: "all 0.3s ease"
                      }}>
                        <div style={{ 
                          fontSize: isMobile ? 15 : 16, 
                          fontWeight: 700, 
                          color: "#a78bfa",
                          marginBottom: "6px",
                          letterSpacing: "-0.01em"
                        }}>
                          💰 Economic Health <span style={{ color: "#64748b", fontWeight: 600 }}>(40%)</span>
                        </div>
                        <div style={{ fontSize: isMobile ? 13 : 14, color: "#cbd5e1", lineHeight: 1.6 }}>
                          Real estate market growth and stability rate.
                        </div>
                      </div>

                      <div style={{
                        background: "rgba(236, 72, 153, 0.06)",
                        border: "1px solid rgba(236, 72, 153, 0.2)",
                        borderRadius: "12px",
                        padding: isMobile ? "14px 16px" : "16px 20px",
                        transition: "all 0.3s ease"
                      }}>
                        <div style={{ 
                          fontSize: isMobile ? 15 : 16, 
                          fontWeight: 700, 
                          color: "#ec4899",
                          marginBottom: "6px",
                          letterSpacing: "-0.01em"
                        }}>
                          🏢 Business Competition <span style={{ color: "#64748b", fontWeight: 600 }}>(20%)</span>
                        </div>
                        <div style={{ fontSize: isMobile ? 13 : 14, color: "#cbd5e1", lineHeight: 1.6 }}>
                          Number of businesses already in the area.
                        </div>
                      </div>

                      <div style={{
                        background: "rgba(234, 179, 8, 0.06)",
                        border: "1px solid rgba(234, 179, 8, 0.25)",
                        borderRadius: "12px",
                        padding: isMobile ? "14px 16px" : "16px 20px",
                        transition: "all 0.3s ease"
                      }}>
                        <div style={{ 
                          fontSize: isMobile ? 15 : 16, 
                          fontWeight: 700, 
                          color: "#fbbf24",
                          marginBottom: "6px",
                          letterSpacing: "-0.01em"
                        }}>
                          🎯 Audience & Saturation Adjustment
                        </div>
                        <div style={{ fontSize: isMobile ? 13 : 14, color: "#cbd5e1", lineHeight: 1.6 }}>
                          <span style={{ color: "#86efac" }}>+15 pts</span> if the right customers are present, or <span style={{ color: "#fca5a5" }}>-15 pts</span> if the market is already crowded.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{
                        background: "rgba(59, 130, 246, 0.06)",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                        borderRadius: "12px",
                        padding: isMobile ? "14px 16px" : "16px 20px",
                        transition: "all 0.3s ease"
                      }}>
                        <div style={{ 
                          fontSize: isMobile ? 15 : 16, 
                          fontWeight: 700, 
                          color: "#60a5fa",
                          marginBottom: "6px",
                          letterSpacing: "-0.01em"
                        }}>
                          🚶 Foot Traffic <span style={{ color: "#64748b", fontWeight: 600 }}>(40%)</span>
                        </div>
                        <div style={{ fontSize: isMobile ? 13 : 14, color: "#cbd5e1", lineHeight: 1.6 }}>
                          People walking through the area, measuring customer flow.
                        </div>
                      </div>

                      <div style={{
                        background: "rgba(139, 92, 246, 0.06)",
                        border: "1px solid rgba(139, 92, 246, 0.2)",
                        borderRadius: "12px",
                        padding: isMobile ? "14px 16px" : "16px 20px",
                        transition: "all 0.3s ease"
                      }}>
                        <div style={{ 
                          fontSize: isMobile ? 15 : 16, 
                          fontWeight: 700, 
                          color: "#a78bfa",
                          marginBottom: "6px",
                          letterSpacing: "-0.01em"
                        }}>
                          💰 Economic Health <span style={{ color: "#64748b", fontWeight: 600 }}>(40%)</span>
                        </div>
                        <div style={{ fontSize: isMobile ? 13 : 14, color: "#cbd5e1", lineHeight: 1.6 }}>
                          Real estate market growth and stability rate.
                        </div>
                      </div>

                      <div style={{
                        background: "rgba(236, 72, 153, 0.06)",
                        border: "1px solid rgba(236, 72, 153, 0.2)",
                        borderRadius: "12px",
                        padding: isMobile ? "14px 16px" : "16px 20px",
                        transition: "all 0.3s ease"
                      }}>
                        <div style={{ 
                          fontSize: isMobile ? 15 : 16, 
                          fontWeight: 700, 
                          color: "#ec4899",
                          marginBottom: "6px",
                          letterSpacing: "-0.01em"
                        }}>
                          🏢 Business Competition <span style={{ color: "#64748b", fontWeight: 600 }}>(20%)</span>
                        </div>
                        <div style={{ fontSize: isMobile ? 13 : 14, color: "#cbd5e1", lineHeight: 1.6 }}>
                          Number of businesses already in the area.
                        </div>
                      </div>
                    </div>
                  )}
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