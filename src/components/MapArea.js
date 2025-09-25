// components/MapArea.js
import React, { useEffect, useRef, useState } from "react";
import categories from "../data/categories";

const KAKAO_SDK_URL =
  "https://dapi.kakao.com/v2/maps/sdk.js?appkey=372e542b613b1ef7e025788b17820c92&autoload=false&libraries=services";

function MapArea({ onAreaSelect, radius, setRadius }) {
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

    let mapInstance = null;

    const initMap = () => {
      const container = document.getElementById("map");
      const defaultCenter = new window.kakao.maps.LatLng(37.5665, 126.9780);
      const map = new window.kakao.maps.Map(container, { center: defaultCenter, level: 5 });
      mapInstance = map;
      mapRef.current = map;

      const marker = new window.kakao.maps.Marker({ map });
      markerRef.current = marker;

      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoderRef.current = geocoder;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const loc = new window.kakao.maps.LatLng(lat, lng);
            map.setCenter(loc);
            marker.setPosition(loc);
          },
          () => console.warn("Geolocation denied; fallback to default.")
        );
      }

      window.kakao.maps.event.addListener(map, "click", (e) => {
        const latlng = e.latLng;
        marker.setPosition(latlng);

        geocoder.coord2Address(
          latlng.getLng(),
          latlng.getLat(),
          (result, status) => {
            if (status === window.kakao.maps.services.Status.OK && result[0]) {
              const address = result[0].address?.address_name ?? "N/A";
              const coords = { lat: latlng.getLat(), lng: latlng.getLng(), address };
              onAreaSelectRef.current?.(coords, businessInput || null);
            }
          }
        );
      });
    };

    if (window.kakao?.maps?.services) {
      window.kakao.maps.load(initMap);
    } else {
      const script = document.createElement("script");
      script.src = KAKAO_SDK_URL;
      script.async = true;
      script.onload = () => window.kakao?.maps && window.kakao.maps.load(initMap);
      document.head.appendChild(script);
    }

    return () => {
      if (mapInstance) {
        window.kakao.maps.event.removeListener(mapInstance, "click");
      }
    };
  }, []);

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
          if (businessInput && businessInput.trim() !== "") {
            onAreaSelectRef.current?.(coords, businessInput);
          } else {
            onAreaSelectRef.current?.(coords, null);
          }
        } else {
          const ps = new window.kakao.maps.services.Places();
          ps.keywordSearch(
            searchInput,
            (places, pStatus) => {
              if (pStatus === window.kakao.maps.services.Status.OK && places.length) {
                const p = places[0];
                const lat = parseFloat(p.y);
                const lng = parseFloat(p.x);
                const address = p.address_name || p.place_name || searchInput;

                const latlng = new window.kakao.maps.LatLng(lat, lng);
                map.setCenter(latlng);
                marker.setPosition(latlng);

                const coords = { lat, lng, address };
                if (businessInput && businessInput.trim() !== "") {
                  onAreaSelectRef.current?.(coords, businessInput);
                } else {
                  onAreaSelectRef.current?.(coords, null);
                }
              } else {
                console.error("검색 결과가 없습니다.");
              }
            },
            { useMapBounds: false }
          );
        }
      },
      { analyzeType: "similar", size: 5 }
    );
  };

  // Autocomplete
  const handleBusinessChange = (e) => {
    const value = e.target.value;
    setBusinessInput(value);
    if (!value.trim()) {
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
    <section className="sidebar">
      <div className="panel glass">
        <div className="panel-title">Search Area</div>

        <label className="label">Address or Location</label>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="e.g., 부산대학교 or 구/동"
          className="input"
        />

        <label className="label">Business Category (optional)</label>
        <div className="autocomplete">
          <input
            type="text"
            value={businessInput}
            onChange={handleBusinessChange}
            placeholder="e.g., 카페, 치킨"
            className="input"
          />
          {showSuggestions && filteredCategories.length > 0 && (
            <ul className="autocomplete-list">
              {filteredCategories.map((cat, idx) => (
                <li key={idx} className="autocomplete-item" onClick={() => handleSuggestionClick(cat)}>
                  {cat}
                </li>
              ))}
            </ul>
          )}
        </div>

        <label className="label">Radius: <b>{radius.toLocaleString()} m</b></label>
        <input
          type="range"
          min="300"
          max="3000"
          step="100"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="range"
        />

        <button onClick={handleSearch} className="btn-primary">SEARCH</button>
      </div>

      <div className="map-wrap neon">
        <div id="map" className="map-canvas" />
      </div>
    </section>
  );
}

export default MapArea;
