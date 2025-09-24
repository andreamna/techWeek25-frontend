// App.js
import React, { useState } from "react";
import axios from "axios";
import Header from "./components/Header";
import MapArea from "./components/MapArea";
import Dashboard from "./components/Dashboard";

const API_URL = "/api/v1/locations/analysis";

const DEFAULT_RADIUS = 1000;

function App() {
  const [businessData, setBusinessData] = useState(null);

  const handleAreaSelect = async (coords) => {
    console.log("In handleAreaSelect: " + coords + "Radius" + DEFAULT_RADIUS);
    try {
      const response = await axios.post(API_URL, {
        lat: coords.lat,
        lng: coords.lng,
        radius: DEFAULT_RADIUS,
      });

      setBusinessData({
        ...response.data,
        address: coords.address,
      });
    } catch (error) {
      console.error(
        "Error fetching business data:",
        error.response?.status,
        error.response?.data || error.message
      );
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