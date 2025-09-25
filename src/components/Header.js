// components/Header.js
import React from "react";

function Header() {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-dot" />
        <span className="brand-text">BizScope</span>
      </div>
      <div className="tagline">Check business opportunities in your chosen area.</div>
    </header>
  );
}

export default Header;
