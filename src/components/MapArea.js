import React from "react";

function MapArea({ onAreaSelect }) {
  return (
    <div
      className="map-placeholder"
      onClick={() =>
        onAreaSelect({ lat: 37.5665, lng: 126.9780 }) // mock coords (Seoul)
      }
    >
      <p>Click here to select area (Kakao Map will go here later)</p>
    </div>
  );
}

export default MapArea;
