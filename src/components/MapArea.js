import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const KAKAO_SDK_URL =
  "https://dapi.kakao.com/v2/maps/sdk.js?appkey=372e542b613b1ef7e025788b17820c92&autoload=false&libraries=services";

function MapArea({ onAreaSelect }) {
  const [searchInput, setSearchInput] = useState("");
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);

  // Load SDK (with services) and init the map
  useEffect(() => {
    const initMap = () => {
      const container = document.getElementById("map");
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780), // Seoul
        level: 5,
      };

      const map = new window.kakao.maps.Map(container, options);
      mapRef.current = map;

      const marker = new window.kakao.maps.Marker({ map });
      markerRef.current = marker;

      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoderRef.current = geocoder;

      // click on map → reverse geocode → send to backend
      window.kakao.maps.event.addListener(map, "click", (mouseEvent) => {
        const latlng = mouseEvent.latLng;
        marker.setPosition(latlng);

        geocoder.coord2Address(
          latlng.getLng(),
          latlng.getLat(),
          (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const address = result[0]?.address?.address_name ?? "";
              const coords = { lat: latlng.getLat(), lng: latlng.getLng(), address };
              // notify parent
              onAreaSelect?.(coords);
              
                axios.post("/api/v1/locations/analysis", {
                  lat: coords.lat,
                  lng: coords.lng,
                
                
              }).catch((e) => console.error("POST failed:", e));
            }
          }
        );
      });
    };

    // Already loaded with services?
    if (window.kakao?.maps?.services) {
      window.kakao.maps.load(initMap);
      return;
    }

    // Not loaded or loaded without services → inject the correct one
    const script = document.createElement("script");
    script.src = KAKAO_SDK_URL;
    script.async = true;
    script.onload = () => {
      if (window.kakao?.maps) {
        window.kakao.maps.load(initMap);
      }
    };
    document.head.appendChild(script);

    // cleanup (remove listeners if you add any outside kakao)
    return () => {};
  }, [onAreaSelect]);

  // search handler (forward geocode)
  const handleSearch = () => {
    const geocoder = geocoderRef.current;
    const map = mapRef.current;
    const marker = markerRef.current;

    if (!geocoder || !map || !marker || !searchInput) return;

    // Best results with **Korean** addresses (도로명/지번/구).
    geocoder.addressSearch(searchInput, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result[0]) {
        const lat = parseFloat(result[0].y);
        const lng = parseFloat(result[0].x);
        const address = result[0].address?.address_name ?? searchInput;

        const latlng = new window.kakao.maps.LatLng(lat, lng);
        map.setCenter(latlng);
        marker.setPosition(latlng);

        const coords = { lat, lng, address };
        onAreaSelect?.(coords);

        axios.post("http://13.58.234.5:8080/api/v1/locations/analysis", {
          lat: coords.lat,
          lng: coords.lng,
        }).catch((e) => console.error("POST failed:", e));
      }
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          placeholder="주소 또는 구를 입력 (한국어 권장)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{ padding: 6, width: 260 }}
        />
        <button onClick={handleSearch} style={{ marginLeft: 8, padding: "6px 12px" }}>
          Search
        </button>
      </div>

      <div
        id="map"
        style={{
          width: "600px",
          height: "400px",
          borderRadius: 8,
          border: "2px solid #c9a227",
        }}
      />
    </div>
  );
}

export default MapArea;
