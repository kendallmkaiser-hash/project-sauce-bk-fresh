"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Store {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: string;
  affordability: number;
  hours: string;
  description: string;
  tags: string[];
}

const affordabilityLabel = (level: number) => {
  if (level === 1) return { text: "$", color: "#2D6A4F", label: "Very Affordable" };
  if (level === 2) return { text: "$$", color: "#E9C46A", label: "Moderate" };
  return { text: "$$$", color: "#E76F51", label: "Pricier" };
};

function createCustomIcon(affordability: number) {
  const { color } = affordabilityLabel(affordability);
  return L.divIcon({
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;">${"$".repeat(affordability)}</div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

interface StoreMapProps {
  stores: Store[];
  selectedStore?: string | null;
  onStoreSelect?: (storeId: string) => void;
  height?: string;
  scrollZoom?: boolean;
}

export default function StoreMap({
  stores,
  selectedStore,
  onStoreSelect,
  height = "500px",
  scrollZoom = true,
}: StoreMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full bg-gray-100 rounded-xl flex items-center justify-center" style={{ height }}>
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  const center: [number, number] = [40.6892, -73.9816];

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-lg" style={{ height }}>
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={scrollZoom}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {stores.map((store) => {
          const aff = affordabilityLabel(store.affordability);
          return (
            <Marker
              key={store.id}
              position={[store.lat, store.lng]}
              icon={createCustomIcon(store.affordability)}
              eventHandlers={{
                click: () => onStoreSelect?.(store.id),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-base">{store.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{store.address}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className="deal-badge text-white"
                      style={{ backgroundColor: aff.color }}
                    >
                      {aff.label}
                    </span>
                    <span className="text-xs text-gray-500">{store.type}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{store.hours}</p>
                  <p className="text-sm mt-2">{store.description}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
