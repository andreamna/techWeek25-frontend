import React from "react";

function Header() {
  return (
    <div style={{ 
      textAlign: "center", 
      padding: "20px",
      backgroundColor: "#2C1810",
      color: "#FFD700"
    }}>
      <h1 style={{ fontSize: "48px", margin: "0", fontWeight: "bold" }}>
        BizScope
      </h1>
      <p style={{ fontSize: "18px", margin: "10px 0", color: "#DDD" }}>
        Check business opportunities in your chosen area.
      </p>
    </div>
  );
}