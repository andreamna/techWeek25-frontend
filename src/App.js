import React, { useState } from "react";
import Header from "./components/Header";
import MapArea from "./components/MapArea";
import Dashboard from "./components/Dashboard";
import axios from "axios";

function App() {
  const [businessData, setBusinessData] = useState(null);

  const fetchBusinessData = async (coords) => {
    try {
      const response = await axios.post("http://localhost:8080/api/businesses", {
        lat: coords.lat,
        lng: coords.lng,
        radius: 1000, // example radius in meters
      });
      setBusinessData(response.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  return (
    <div className="app-container">
      <Header />
      <main className="main-layout">
        <MapArea onAreaSelect={fetchBusinessData} />
        <Dashboard data={businessData} />
      </main>
    </div>
  );
}

export default App;
