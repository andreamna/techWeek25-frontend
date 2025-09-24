import React, { useEffect, useRef, useState } from "react";

const KAKAO_SDK_URL =
  "https://dapi.kakao.com/v2/maps/sdk.js?appkey=372e542b613b1ef7e025788b17820c92&autoload=false&libraries=services";

function MapArea({ onAreaSelect }) {
  const [searchInput, setSearchInput] = useState("");
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

    let mapInstance = null; // Temporary variable to hold the map instance

    const initMap = () => {
      const container = document.getElementById("map");
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780), // Seoul
        level: 5,
      };

      const map = new window.kakao.maps.Map(container, options);
      mapInstance = map; // Store the instance
      mapRef.current = map;

      const marker = new window.kakao.maps.Marker({ map });
      markerRef.current = marker;

      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoderRef.current = geocoder;

      // 지도 클릭 → 역지오코딩 → 부모에 좌표 전달(POST는 부모가)
      window.kakao.maps.event.addListener(map, "click", (mouseEvent) => {
        const latlng = mouseEvent.latLng;
        marker.setPosition(latlng);

        geocoder.coord2Address(
          latlng.getLng(),
          latlng.getLat(),
          (result, status) => {
            if (status === window.kakao.maps.services.Status.OK && result[0]) {
              const address = result[0].address?.address_name ?? "N/A";
              const coords = { lat: latlng.getLat(), lng: latlng.getLng(), address };
              onAreaSelectRef.current?.(coords);
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
      script.onload = () => window.kakao?.maps && window.kakao.maps.load(initMap);
      document.head.appendChild(script);
    }

    // ✨ THE FIX IS HERE ✨
    // This function will run when the component unmounts
    return () => {
      if (mapInstance) {
        // We remove all event listeners from the map to prevent "ghost" listeners
        window.kakao.maps.event.removeListener(mapInstance, "click");
      }
    };

  }, []); // 의존성 없음!

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

          onAreaSelectRef.current?.({ lat, lng, address });
        } else {
          // 폴백: 키워드 검색
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

                onAreaSelectRef.current?.({ lat, lng, address });
              } else {
                console.error("검색 결과가 없습니다.", status, pStatus);
              }
            },
            { useMapBounds: false }
          );
        }
      },
      { analyzeType: "similar", size: 5 }
    );
  };

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          placeholder="주소 또는 구 입력 (한국어 권장)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{ padding: 6, width: 260 }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button onClick={handleSearch} style={{ marginLeft: 8, padding: "6px 12px" }}>
          Search
        </button>
      </div>

      <div
        id="map"
        style={{ width: "600px", height: "400px", borderRadius: 8, border: "2px solid #c9a227" }}
      />
    </div>
  );
}

export default MapArea;