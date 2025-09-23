import React, { useState } from "react";
import axios from "axios";
import Header from "./components/Header";
import MapArea from "./components/MapArea";
import Dashboard from "./components/Dashboard";

function App() {
  const [businessData, setBusinessData] = useState(null);

  const handleAreaSelect = async (coords) => {
    try {
      const response = await axios.post("http://13.58.234.5:8080/api/v1/locations/analysis", {
        lat: coords.lat,
        lng: coords.lng,
        radius: 1000,
      });
  
      setBusinessData({
        ...response.data,
        address: coords.address,
      });
    } catch (error) {
      console.error("Error fetching business data:", error);
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
