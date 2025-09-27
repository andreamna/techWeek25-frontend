import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from "recharts";

function FloatingCharts({ data }) {
  if (!data) {
    return <p>No floating population data available.</p>;
  }

  const { weeklyRhythm, hourlyBreakdown } = data;

  // ✅ Chart 1: Typical Week (average traffic per weekday)
  const weeklyData = Object.entries(weeklyRhythm || {}).map(([day, value]) => ({
    day,
    value: Number(value.toFixed(1)),
  }));

  // ✅ Chart 2: Weekday vs Weekend hourly averages
  const getAverage = (days) => {
    const totals = Array(24).fill(0);
    const counts = Array(24).fill(0);

    days.forEach((day) => {
      if (hourlyBreakdown[day]) {
        hourlyBreakdown[day].forEach((val, i) => {
          totals[i] += val;
          counts[i] += 1;
        });
      }
    });

    return totals.map((sum, i) => (counts[i] > 0 ? sum / counts[i] : 0));
  };

  const weekdayAvg = getAverage(["MON", "TUE", "WED", "THU", "FRI"]);
  const weekendAvg = getAverage(["SAT", "SUN"]);

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    weekday: Number(weekdayAvg[i].toFixed(1)),
    weekend: Number(weekendAvg[i].toFixed(1)),
  }));

  return (
    <div style={{ width: "100%", height: "100%", color: "white" }}>
      <h3 style={{ marginBottom: "10px" }}>📊 Typical Week (Average Traffic)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={weeklyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>

      <h3 style={{ margin: "20px 0 10px" }}>📈 Weekday vs Weekend Hourly Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={hourlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="weekday" stroke="#10b981" name="Weekday Avg" />
          <Line type="monotone" dataKey="weekend" stroke="#f59e0b" name="Weekend Avg" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default FloatingCharts;