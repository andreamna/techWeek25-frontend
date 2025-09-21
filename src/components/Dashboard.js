import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#c9a227", "#8d6e63", "#6d4c41", "#d7ccc8"];

function Dashboard({ data }) {
  if (!data) {
    return (
      <div className="dashboard">
        <h2>Dashboard</h2>
        <p>No area selected yet.</p>
      </div>
    );
  }

  const chartData = Object.entries(data.categories).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <p><strong>Total Businesses:</strong> {data.totalBusinesses}</p>

      <PieChart width={300} height={250}>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={100}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}

export default Dashboard;
