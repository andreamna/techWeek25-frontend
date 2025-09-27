// src/components/FloatingPro.js
import React, { useMemo, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

/** Expects: data = { weeklyRhythm, hourlyBreakdown } */
export default function FloatingPro({ data }) {
  const [series, setSeries] = useState("all"); // 'all'|'weekday'|'weekend'

  // Always declare defaults first (safe for hooks)
  const days = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
  const weeklyRhythm = data?.weeklyRhythm || {};
  const hourlyBreakdown = data?.hourlyBreakdown || {};

  /* ===== Weekly summary ===== */
  const weekly = days.map(d => ({ day: d, value: +(weeklyRhythm[d] || 0).toFixed(1) }));
  const busiestDay = weekly.reduce((a,b)=> b.value>a.value? b:a, { value:-Infinity });

  /* ===== Hourly series ===== */
  const avgFor = (subset) => {
    const t = Array(24).fill(0), c = Array(24).fill(0);
    subset.forEach(d => (hourlyBreakdown[d] || []).forEach((v,i)=>{ t[i]+=v; c[i]++; }));
    return t.map((s,i)=> c[i] ? s/c[i] : 0);
  };
  const weekdayAvg = avgFor(["MON","TUE","WED","THU","FRI"]);
  const weekendAvg = avgFor(["SAT","SUN"]);

  const hourlyAll = useMemo(()=> {
    return Array.from({length:24},(_,i)=>({
      hour: `${String(i).padStart(2,"0")}:00`,
      weekday: +weekdayAvg[i].toFixed(1),
      weekend: +weekendAvg[i].toFixed(1),
      all: +(((weekdayAvg[i]*(5/7)) + (weekendAvg[i]*(2/7)))).toFixed(1)
    }));
  }, [weekdayAvg, weekendAvg]);

  const peakIdx = hourlyAll.reduce((m,_,i)=> hourlyAll[i].all > hourlyAll[m].all ? i : m, 0);
  const peakHour = hourlyAll[peakIdx]?.hour || "18:00";
  const avgDaily = Math.round(weekly.reduce((a,b)=>a+b.value,0)/7);

  const activeKey = series === "all" ? "all" : (series === "weekday" ? "weekday" : "weekend");
  const seriesLabel = series === "all" ? "All Days" : (series === "weekday" ? "Weekday" : "Weekend");

  /* ===== Heatmap (2-hour blocks × 7) ===== */
  const blocks = Array.from({length:12},(_,i)=>`${String(i*2).padStart(2,"0")}–${String(i*2+2).padStart(2,"0")}`);
  const heatmap = days.flatMap(d => {
    const arr = hourlyBreakdown[d] || [];
    return blocks.map((b,idx)=>{
      const start = idx*2, end=start+2;
      const avg = arr.slice(start,end).reduce((a,b)=>a+b,0)/2 || 0;
      return { day:d, block:b, value:avg };
    });
  });

  // ✅ Safe conditional render after hooks
  if (!data) {
    return <p className="muted">No floating population data available.</p>;
  }

  return (
    <div className="dash">
      {/* KPI row */}
      <div className="cards">
        <div className="card glass metric">
          <div className="metric-label">Busiest Day</div>
          <div className="metric-value">{busiestDay.day}</div>
          <div className="muted">Avg {Math.round(busiestDay.value)}</div>
        </div>
        <div className="card glass metric">
          <div className="metric-label">Peak Hour</div>
          <div className="metric-value">{peakHour}</div>
          <div className="muted">Highest hourly avg</div>
        </div>
        <div className="card glass metric">
          <div className="metric-label">Avg Daily Visitors</div>
          <div className="metric-value">{avgDaily}</div>
          <div className="muted">Index (0–100)</div>
        </div>
      </div>

      {/* Interactive hourly chart */}
      <div className="card chart-card">
        <div className="card-title">Hourly Trend • {seriesLabel}</div>
        <div className="pills">
          {["all","weekday","weekend"].map(p=>(
            <button key={p} className={`pill ${series===p ? "active":""}`} onClick={()=>setSeries(p)}>
              {p==="all"?"All Days": p==="weekday"?"Weekday":"Weekend"}
            </button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={hourlyAll}>
            <defs>
              <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.08}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
            <XAxis dataKey="hour" interval={2} />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey={activeKey} stroke="#3b82f6" fill="url(#grad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly bars */}
      <div className="card chart-card">
        <div className="card-title">Weekly Traffic</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weekly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Heatmap (2h blocks) */}
      <div className="card chart-card">
        <div className="card-title">Traffic Intensity (2-hour blocks)</div>
        <div className="heatmap-wrap">
          <div className="heatmap-grid" style={{ gridTemplateColumns: "80px repeat(12,1fr)" }}>
            <div></div>
            {blocks.map(b=><div key={b} className="heatmap-h">{b}</div>)}
            {days.map(d=>(
              <React.Fragment key={d}>
                <div className="heatmap-r">{d}</div>
                {blocks.map(b=>{
                  const v = heatmap.find(x=>x.day===d && x.block===b)?.value || 0;
                  const alpha = Math.min(1, v/100);
                  return <div key={`${d}-${b}`} className="heat-cell"
                    title={`${d} ${b}: ${Math.round(v)}`}
                    style={{ background:`rgba(59,130,246,${0.18 + alpha*0.65})` }}/>;
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
