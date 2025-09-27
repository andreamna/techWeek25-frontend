// App.js
import React, { useState } from "react";
import axios from "axios";
import Header from "./components/Header";
import MapArea from "./components/MapArea";
import Dashboard from "./components/Dashboard";
import "./App.css";

const API_URL = "/api/v1/locations/analysis";

function App() {
  const [businessData, setBusinessData] = useState(null);
  const [radius, setRadius] = useState(1000); // meters

  const handleAreaSelect = async (coords, businessType = "") => {
    try {
      console.log("Hello from the console!");
      const payload = {
        latitude: coords.lat,
        longitude: coords.lng,
        radius, // <- use UI radius
      };
      if (businessType && businessType.trim() !== "") {
        payload.businessType = businessType;
      }

      const { data } = await axios.post(API_URL, payload);

      console.log("printing my data!");
      console.log("Weekly Rhythm Monday: " + data.congestionData.weeklyRhythm.MON);
      console.log("Weekly Rhythm Tuesday: " + data.congestionData.weeklyRhythm.TUE);
      console.log("Weekly Rhythm Wednesday: " + data.congestionData.weeklyRhythm.WED);
      console.log("Weekly Rhythm Thursday: " + data.congestionData.weeklyRhythm.THU);
      console.log("Weekly Rhythm Friday: " + data.congestionData.weeklyRhythm.FRI);
      console.log("Weekly Rhythm Saturday: " + data.congestionData.weeklyRhythm.SAT);
      console.log("Weekly Rhythm Sunday: " + data.congestionData.weeklyRhythm.SUN);

      console.log("Hourly Breakdown Monday 0 AM" + data.congestionData.hourlyBreakdown.MON[0]);

      setBusinessData({
        ...data,
        address: coords.address,
      });
    } catch (err) {
      console.error("Error fetching business data:", err.response?.status, err.response?.data || err.message);
      setBusinessData({
        totalCount: 0,
        categoryCounts: {},
        address: coords.address,
      });
    }
  };

  return (
    <div className="app-shell">
      <Header />
      <main className="content-wrap">
        {/* Left Panel (search + controls live inside MapArea) */}
        <MapArea onAreaSelect={handleAreaSelect} radius={radius} setRadius={setRadius} />
        {/* Right Panel */}
        <Dashboard data={businessData} />
      </main>
    </div>
  );
}

export default App;
