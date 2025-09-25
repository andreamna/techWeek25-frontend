import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#c9a227", "#8d6e63", "#6d4c41", "#d7ccc8", "#9c6644", "#deb887"];

function Dashboard({ data }) {
  const [showAll, setShowAll] = useState(false);

  if (!data) {
    return (
      <div className="dashboard">
        <h2>Dashboard</h2>
        <p>No area selected yet.</p>
      </div>
    );
  }

  const totalBusinesses = data.totalCount ?? 0;
  const categories = data.categoryCounts || {};

  // Sort categories by value (descending)
  const sortedCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]);

  // ✅ Only top 5 go into the pie chart
  const topCategories = sortedCategories.slice(0, 5).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <p><strong>Address:</strong> {data.address || "N/A"}</p>
      <p><strong>Total Businesses:</strong> {totalBusinesses}</p>

      {topCategories.length > 0 ? (
        <>
          <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
            Top 5 Business Categories
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topCategories}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                fill="#c9a227"
                label
              >
                {topCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </>
      ) : (
        <p>No business category data available yet.</p>
      )}

      {/* Toggle full list */}
      <button 
        onClick={() => setShowAll(!showAll)} 
        style={{ marginTop: "10px", padding: "6px 12px", cursor: "pointer" }}
      >
        {showAll ? "Hide all" : "Show all"}
      </button>

      {showAll && (
        <div style={{ maxHeight: "200px", overflowY: "auto", marginTop: "10px" }}>
          <ul>
            {sortedCategories.map(([name, value]) => (
              <li key={name}>{name}: {value}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
