import React, { useState } from "react";
import axios from "axios";
import Header from "./components/Header";
import MapArea from "./components/MapArea";
import Dashboard from "./components/Dashboard";

function App() {
  const [businessData, setBusinessData] = useState(null);

  const handleAreaSelect = async (coords) => {
    try {
      // Call backend API with lat/lng
      const response = await axios.post("http://localhost:8080/api/businesses", {
        lat: coords.lat,
        lng: coords.lng,
        radius: 1000,
      });

      // Merge backend result with address
      setBusinessData({
        ...response.data,
        address: coords.address, // add human-readable address
      });
    } catch (error) {
      console.error("Error fetching business data:", error);
      // fallback if backend is down
      setBusinessData({
        totalBusinesses: 0,
        categories: {},
        address: coords.address,
      });
    }
  };

  return (
    <div className="App">
      <Header />
      <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
        <MapArea onAreaSelect={handleAreaSelect} />
        <Dashboard data={businessData} />
      </div>
    </div>
  );
}

export default App;
