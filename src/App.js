// src/App.js
import React, { useState } from "react";
import axios from "axios";
import Header from "./components/Header";
import MapArea from "./components/MapArea";
import DataTabs from "./components/DataTabs";
import "./App.css";

const API_URL = "/api/v1/locations/analysis";
const DEFAULT_RADIUS = 1000;

function App() {
  const [businessData, setBusinessData] = useState(null);
  const [floatingData, setFloatingData] = useState(null);
  const [realEstateData, setRealEstateData] = useState(null);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);

  const handleAreaSelect = async (coords) => {
    try {
      const response = await axios.post(API_URL, {
        latitude: coords.lat,
        longitude: coords.lng,
        radius: radius,
      });

      const data = response.data;

      // Example competition score calculation
      const score = Math.max(0, Math.min(100, data.competitionIndex ?? 0));

      setBusinessData({
        ...data,
        address: coords.address,
        competitionScore: score,
      });

      setFloatingData(data.congestionData || null);

      // ✅ Pass real estate trends directly
      setRealEstateData(data.realEstateTrends || null);

      console.log("RealEstateData passed to DataTabs:", data.realEstateTrends);
    } catch (err) {
      console.error(
        "Error fetching business data:",
        err.response?.status,
        err.response?.data || err.message
      );
      setBusinessData(null);
      setFloatingData(null);
      setRealEstateData(null);
    }
  };

  return (
    <div className="app-shell">
      <Header />
      <main className="content-wrap">
        <MapArea
          onAreaSelect={handleAreaSelect}
          radius={radius}
          setRadius={setRadius}
        />
        {businessData && (
          <DataTabs
            businessData={businessData}
            floatingData={floatingData}
            realEstateData={realEstateData}
          />
        )}
      </main>
    </div>
  );
}

export default App;
