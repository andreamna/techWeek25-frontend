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

  // Now accepts coords and optional businessType
  const handleAreaSelect = async (coords, businessType = "") => {
    try {
      // build request payload dynamically
      const payload = {
        latitude: coords.lat,
        longitude: coords.lng,
        radius: DEFAULT_RADIUS,
      };

      if (businessType && businessType.trim() !== "") {
        payload.businessType = businessType;
      }

      const response = await axios.post(API_URL, payload);

      console.log("Backend response:", response.data);

      setBusinessData({
        ...response.data,
        address: coords.address,
      });
    } catch (err) {
      console.error(
        "Error fetching business data:",
        err.response?.status,
        err.response?.data || err.message
      );
      setBusinessData({
        totalCount: 0,
        categoryCounts: {},
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
