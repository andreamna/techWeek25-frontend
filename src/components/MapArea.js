import React, { useEffect } from "react";

function MapArea({ onAreaSelect }) {
  useEffect(() => {
    const initMap = () => {
      const container = document.getElementById("map");
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780), // Seoul City Hall
        level: 5,
      };

      const map = new window.kakao.maps.Map(container, options);

      let marker = new window.kakao.maps.Marker();
      marker.setMap(map);

      // ✅ Check if services library is available
      if (!window.kakao.maps.services) {
        console.error("❌ Kakao Maps services library not loaded");
        return;
      }

      const geocoder = new window.kakao.maps.services.Geocoder();

      // 📍 Add click event
      window.kakao.maps.event.addListener(map, "click", function (mouseEvent) {
        const latlng = mouseEvent.latLng;
        marker.setPosition(latlng);

        const coords = {
          lat: latlng.getLat(),
          lng: latlng.getLng(),
        };

        // ✅ Reverse Geocoding
        geocoder.coord2Address(coords.lng, coords.lat, function (result, status) {
          if (status === window.kakao.maps.services.Status.OK && result[0]) {
            const address = result[0].address.address_name;
            console.log("📍 Selected:", coords, "→", address);

            onAreaSelect({
              ...coords,
              address,
            });
          } else {
            console.warn("⚠️ Address lookup failed");
            onAreaSelect({
              ...coords,
              address: "N/A",
            });
          }
        });
      });
    };

    // ✅ If already loaded
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(initMap);
      return;
    }

    // ✅ Otherwise inject script
    const script = document.createElement("script");
    const kakaoKey = process.env.REACT_APP_KAKAO_API_KEY;
    script.src =
    "https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&libraries=services&autoload=false";
    script.async = true;
    script.onload = () => {
      console.log("✅ Kakao script loaded");
      window.kakao.maps.load(() => {
        console.log("✅ Kakao maps loaded. Services:", window.kakao.maps.services);
        initMap();
      });
    };
    document.head.appendChild(script);
  }, [onAreaSelect]);

  return (
    <div
      id="map"
      style={{
        width: "600px",
        height: "400px",
        borderRadius: "8px",
        border: "2px solid #c9a227",
      }}
    />
  );
}

export default MapArea;
