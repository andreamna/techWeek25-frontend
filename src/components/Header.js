// components/Header.js
import React from "react";

function Header() {
  return (
    <header className="topbar">
      <div className="brand">
        <img 
          src="/BizVision_logo3.png" 
          alt="BizVision Logo" 
          className="brand-logo"
        />
        <span className="brand-text">BizVision</span>
      </div>
      <div className="tagline">Check business opportunities in your chosen area.</div>
    </header>
  );
}

export default Header;
