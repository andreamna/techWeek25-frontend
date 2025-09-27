import React, { useState } from "react";
import { useSwipeable } from "react-swipeable";
import Dashboard from "./Dashboard";
import "../App.css"

function DataTabs({ businessData, floatingData, realEstateData }) {
  const [activeTab, setActiveTab] = useState(0); // 0: Business, 1: Floating, 2: Real Estate

  // Define swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setActiveTab((prev) => Math.min(prev + 1, 2)),
    onSwipedRight: () => setActiveTab((prev) => Math.max(prev - 1, 0)),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  return (
    <div className="data-tabs" {...swipeHandlers}>
      {/* Tab Buttons */}
      <div className="tab-header">
        <button
          className={activeTab === 0 ? "active" : ""}
          onClick={() => setActiveTab(0)}
        >
          Businesses
        </button>
        <button
          className={activeTab === 1 ? "active" : ""}
          onClick={() => setActiveTab(1)}
        >
          Floating Pop.
        </button>
        <button
          className={activeTab === 2 ? "active" : ""}
          onClick={() => setActiveTab(2)}
        >
          Real Estate
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 0 && (
          <Dashboard data={businessData} />
        )}
        {activeTab === 1 && (
          <div>
            <h3>Floating Population Data</h3>
            <pre>{JSON.stringify(floatingData, null, 2)}</pre>
          </div>
        )}
        {activeTab === 2 && (
          <div>
            <h3>Real Estate Data</h3>
            <pre>{JSON.stringify(realEstateData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTabs;
