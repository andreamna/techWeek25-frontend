// src/components/DataTabs.js
import React, { useMemo, useState } from "react";
import { useSwipeable } from "react-swipeable";
import Dashboard from "./Dashboard";
import FloatingPro from "./FloatingPro";
import DemographicsPro from "./DemographicsPro";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Label
} from "recharts";
import "../App.css";

export default function DataTabs({ businessData, floatingData, realEstateData }) {
  const [activeTab, setActiveTab] = useState(0);
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setActiveTab((p)=>Math.min(p+1,4)),
    onSwipedRight: () => setActiveTab((p)=>Math.max(p-1,0)),
    preventDefaultTouchmoveEvent: true, trackMouse:true
  });

  /* ===== Competition breakdown ===== */
  const score = businessData?.competitionScore ?? 0;
  const totalBusinesses = businessData?.totalCount ?? 0;

  const trafficFactor = useMemo(() => {
    const wr = businessData?.congestionData?.weeklyRhythm || {};
    const vals = Object.values(wr);
    if (!vals.length) return 50;
    return Math.max(0, Math.min(100, vals.reduce((a,b)=>a+b,0)/vals.length));
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
    const seniors = (v.male_60||0)+(v.female_60||0)+(v.male_70_over||0)+(v.female_70_over||0);
    const all = Object.values(v).reduce((a,b)=>a+b,0) || 1;
    const pct = (seniors/all)*100;
    return Math.max(20, 70 - Math.max(0, pct-40));
  }, [businessData]);

  const rentFactor = 50; // placeholder until real-estate is wired

  const breakdown = [
    { name: "Foot Traffic", value: Math.round(trafficFactor) },
    { name: "Business Density", value: Math.round(densityFactor) },
    { name: "Demographics Fit", value: Math.round(demoFactor) },
    { name: "Rent (est.)", value: rentFactor },
  ];

  const donut = [{ name: "Score", value: score }, { name: "Remaining", value: 100 - score }];

  return (
    <div className="data-tabs" {...swipeHandlers}>
      <div className="tab-header">
        {["Competition","Businesses","Floating Pop.","Demographics","Real Estate"].map((t,i)=>(
          <button key={t} className={activeTab===i?"active":""} onClick={()=>setActiveTab(i)}>{t}</button>
        ))}
      </div>

      <div className="tab-content">
        {/* ===== Competition ===== */}
        {activeTab===0 && (
          <div className="grid-2">
            {/* Donut Gauge */}
            <div className="card chart-card">
              <div className="card-title">Competition Index</div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <defs>
                    <linearGradient id="donutGrad" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={donut}
                    dataKey="value"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={70}
                    outerRadius={100}
                    stroke="none"
                  >
                    <Cell key="score" fill="url(#donutGrad)" />
                    <Cell key="remain" fill="rgba(148,163,184,0.2)" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#1f2937",
                      border: "1px solid #374151",
                      color: "var(--text)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ textAlign:"center", fontSize:28, fontWeight:800, marginTop:-12 }}>
                {score}/100
              </div>
              <div className="muted" style={{ textAlign:"center" }}>
                Higher score = better feasibility for a new business.
              </div>
            </div>

            {/* Breakdown Bars */}
            <div className="card chart-card">
              <div className="card-title">What drives this score</div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={breakdown}
                  layout="vertical"
                  margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
                  barCategoryGap={15}
                >
                  <defs>
                    <linearGradient id="barGrad" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#374151" vertical={false} /> {/* ✅ subtle solid lines */}
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: "var(--text)", fontSize: 13 }}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: "var(--text)", fontSize: 14, fontWeight: 600 }}
                    width={160}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1f2937",
                      border: "1px solid #374151",
                      color: "var(--text)",
                    }}
                  />
                  <Bar dataKey="value" fill="url(#barGrad)" radius={[6, 6, 6, 6]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="muted" style={{ marginTop:6 }}>
                Traffic lifts the score; high density / rent pull it down.
              </div>
            </div>
          </div>
        )}

        {/* ===== Businesses ===== */}
        {activeTab===1 && <Dashboard data={businessData} />}

        {/* ===== Floating Pop ===== */}
        {activeTab===2 && <FloatingPro data={floatingData} />}

        {/* ===== Demographics ===== */}
        {activeTab===3 && <DemographicsPro visitors={businessData?.visitorsDistribution} />}

        {/* ===== Real Estate ===== */}
        {activeTab===4 && (
          <div className="card chart-card">
            <div className="card-title">Real Estate (coming soon)</div>
            <pre style={{ whiteSpace:"pre-wrap" }}>{JSON.stringify(realEstateData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
