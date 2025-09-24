import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#c9a227", "#8d6e63", "#6d4c41", "#d7ccc8", "#9c6644", "#deb887"];

function Dashboard({ data }) {
  if (!data) {
    return (
      <div className="dashboard">
        <h2>Dashboard</h2>
        <p>No area selected yet.</p>
      </div>
    );
  }

  // Map backend fields correctly
  const totalBusinesses = data.totalCount ?? 0;
  const categories = data.categoryCounts || {};

  // Prepare chart data
  const chartData = Object.entries(categories).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <p><strong>Address:</strong> {data.address || "N/A"}</p>
      <p><strong>Total Businesses:</strong> {totalBusinesses}</p>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              fill="#c9a227"
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p>No business category data available yet.</p>
      )}
    </div>
  );
}

export default Dashboard;
