import React, { useEffect, useRef, useState } from "react";
import categories from "../data/categories"; // ✅ import your categories

const KAKAO_SDK_URL =
  "https://dapi.kakao.com/v2/maps/sdk.js?appkey=372e542b613b1ef7e025788b17820c92&autoload=false&libraries=services";

function MapArea({ onAreaSelect }) {
  const [searchInput, setSearchInput] = useState("");
  const [businessInput, setBusinessInput] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);

  const initOnceRef = useRef(false);
  const onAreaSelectRef = useRef(onAreaSelect);

  useEffect(() => {
    onAreaSelectRef.current = onAreaSelect;
  }, [onAreaSelect]);

  useEffect(() => {
    if (initOnceRef.current) return;
    initOnceRef.current = true;

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

      // 지도 클릭 → 역지오코딩 → 부모에 좌표 전달
      window.kakao.maps.event.addListener(map, "click", (mouseEvent) => {
        const latlng = mouseEvent.latLng;
        marker.setPosition(latlng);

        geocoder.coord2Address(
          latlng.getLng(),
          latlng.getLat(),
          (result, status) => {
            if (status === window.kakao.maps.services.Status.OK && result[0]) {
              const address = result[0].address?.address_name ?? "N/A";
              const coords = {
                lat: latlng.getLat(),
                lng: latlng.getLng(),
                address,
              };
              onAreaSelectRef.current?.(coords, businessInput || null);
            }
          }
        );
      });
    };

    // SDK 로딩
    if (window.kakao?.maps?.services) {
      window.kakao.maps.load(initMap);
    } else {
      const script = document.createElement("script");
      script.src = KAKAO_SDK_URL;
      script.async = true;
      script.onload = () =>
        window.kakao?.maps && window.kakao.maps.load(initMap);
      document.head.appendChild(script);
    }
  }, []); // ✅ runs only once

  const handleSearch = () => {
    const geocoder = geocoderRef.current;
    const map = mapRef.current;
    const marker = markerRef.current;

    if (!geocoder || !map || !marker || !searchInput.trim()) return;

    geocoder.addressSearch(
      searchInput,
      (result, status) => {
        if (status === window.kakao.maps.services.Status.OK && result.length) {
          const r = result[0];
          const lat = parseFloat(r.y);
          const lng = parseFloat(r.x);
          const address =
            r.road_address?.address_name ||
            r.address?.address_name ||
            r.address_name ||
            searchInput;

          const latlng = new window.kakao.maps.LatLng(lat, lng);
          map.setCenter(latlng);
          marker.setPosition(latlng);

          const coords = { lat, lng, address };
          onAreaSelectRef.current?.(coords, businessInput || null);
        } else {
          console.error("검색 결과가 없습니다.", status);
        }
      },
      { analyzeType: "similar", size: 5 }
    );
  };

  // ✅ autocomplete logic
  const handleBusinessChange = (e) => {
    const value = e.target.value;
    setBusinessInput(value);

    if (value.trim() === "") {
      setFilteredCategories([]);
      setShowSuggestions(false);
    } else {
      const filtered = categories.filter((cat) =>
        cat.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCategories(filtered.slice(0, 8));
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (category) => {
    setBusinessInput(category);
    setShowSuggestions(false);
  };

  return (
    <div>
      {/* Inputs Row */}
      <div
        style={{
          marginBottom: 10,
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        {/* Address Input */}
        <input
          type="text"
          placeholder="주소 또는 구 입력 (한국어 권장)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{
            padding: 6,
            width: "220px",
            height: "38px",
            boxSizing: "border-box",
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />

        {/* Business Input with Autocomplete */}
        <div style={{ position: "relative", width: "220px" }}>
          <input
            type="text"
            placeholder="업종 입력 (예: 카페, 치킨)"
            value={businessInput}
            onChange={handleBusinessChange}
            style={{
              padding: 6,
              width: "220px",
              height: "38px",
              boxSizing: "border-box",
            }}
          />
          {showSuggestions && filteredCategories.length > 0 && (
            <ul
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "white",
                border: "1px solid #ccc",
                maxHeight: "150px",
                overflowY: "auto",
                zIndex: 1000,
                listStyle: "none",
                padding: 0,
                margin: 0,
              }}
            >
              {filteredCategories.map((cat, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSuggestionClick(cat)}
                  style={{
                    padding: "6px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {cat}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          style={{
            padding: "4px 10px",
            height: "32px",
            boxSizing: "border-box",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </div>

      {/* Map */}
      <div
        id="map"
        style={{
          width: "600px",
          height: "400px",
          borderRadius: 8,
          border: "2px solid #c9a227",
          zIndex: 1,
        }}
      />
    </div>
  );
}

export default MapArea;
