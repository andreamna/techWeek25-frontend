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
  const [loading, setLoading] = useState(false);

  const handleAreaSelect = async (coords, category = "") => {
    try {
      setLoading(true);

      const payload = {
        latitude: coords.lat,
        longitude: coords.lng,
        radius: radius,
        category: category,
      };

      // Only include category if selected
      if (category && category.trim() !== "") {
        payload.category = category; // <-- this will be "CE7", "HP8", etc.
      }
      console.log("Sending request body:", payload);

      const response = await axios.post(API_URL, payload);
      const data = response.data;

      let score;
      if (category && category.trim() !== "") {
        score = Math.max(0, Math.min(100, data.tailoredFeasibilityIndex ?? 0));
      } else {
        score = Math.max(0, Math.min(100, data.feasibilityIndex ?? 0));
      }

      setBusinessData({
        address: coords.address,
        scoreType: category && category.trim() !== "" ? "Tailored" : "General",
        competitionScore: score,
        ...data,
      });

      setFloatingData(data.congestionData || null);

      // ✅ Pass real estate trends directly
      setRealEstateData(data.realEstateTrends || null);

      console.log("RealEstateData passed to DataTabs:", data.realEstateTrends);
      console.log ("Feasibility Index:", data.feasibilityIndex);
      console.log ("Tailored Feasibility Index:", data.tailoredFeasibilityIndex);
    } catch (err) {
      console.error(
        "Error fetching business data:",
        err.response?.status,
        err.response?.data || err.message
      );
      setBusinessData(null);
      setFloatingData(null);
      setRealEstateData(null);
    } finally {
      setLoading(false);
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
            loading={loading}
          />
        )}
      </main>
    </div>
  );
}

export default App;
