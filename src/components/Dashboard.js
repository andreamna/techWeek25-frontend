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

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <p><strong>Address:</strong> {data.address || "N/A"}</p>
      <p><strong>Total Businesses:</strong> {data.totalBusinesses ?? 0}</p>

      {data.categories && Object.keys(data.categories).length > 0 ? (
        <ul>
          {Object.entries(data.categories).map(([name, value]) => (
            <li key={name}>
              {name}: {value}
            </li>
          ))}
        </ul>
      ) : (
        <p>No business category data available yet.</p>
      )}
    </div>
  );
}

export default Dashboard;
