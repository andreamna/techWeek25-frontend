// App.js
import React, { useState } from "react";
import axios from "axios";
import Header from "./components/Header";
import MapArea from "./components/MapArea";
import DataTabs from "./components/DataTabs";
import "./App.css";

const API_URL = "/api/v1/locations/analysis";

function App() {
  const [businessData, setBusinessData] = useState(null);
  const [floatingData, setFloatingData] = useState(null);
  const [realEstateData, setRealEstateData] = useState(null);
  const [radius, setRadius] = useState(1000); // meters

  const handleAreaSelect = async (coords, businessType = "") => {
    try {
      const payload = {
        latitude: coords.lat,
        longitude: coords.lng,
        radius,
      };
      if (businessType && businessType.trim() !== "") {
        payload.businessType = businessType;
      }

      const { data } = await axios.post(API_URL, payload);

      // === Competition Index Calculation ===
      const totalBusinesses = data.totalCount || 0;
      const avgTraffic =
        data.congestionData && data.congestionData.weeklyRhythm
          ? Object.values(data.congestionData.weeklyRhythm).reduce(
              (a, b) => a + b,
              0
            ) /
            Object.values(data.congestionData.weeklyRhythm).length
          : 0;

      const age60plus =
        (data.visitorsDistribution?.male_60 || 0) +
        (data.visitorsDistribution?.female_60 || 0) +
        (data.visitorsDistribution?.male_70_over || 0) +
        (data.visitorsDistribution?.female_70_over || 0);

      // Normalize to 0–100
      let score = 50;
      if (avgTraffic > 70) score += 15;
      if (avgTraffic < 50) score -= 10;
      if (totalBusinesses > 50) score -= 15;
      if (totalBusinesses < 20) score += 10;
      if (age60plus > 50) score -= 5;

      score = Math.max(0, Math.min(100, score)); // clamp 0–100

      setBusinessData({
        ...data,
        address: coords.address,
        competitionScore: score,
      });

      setFloatingData(data.congestionData || null);
      setRealEstateData({ message: "Real estate data coming soon" });
    } catch (err) {
      console.error(
        "Error fetching business data:",
        err.response?.status,
        err.response?.data || err.message
      );
      setBusinessData(null);
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
