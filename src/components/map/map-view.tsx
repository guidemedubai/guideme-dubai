"use client";

import { useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapItem {
  id: string;
  name: string;
  type: "property" | "activity";
  latitude: number;
  longitude: number;
  image: string;
  rating: number;
  price: number;
  category?: string;
  city: string;
}

interface MapViewProps {
  items: MapItem[];
  center: { lat: number; lng: number };
  zoom: number;
  selectedItem: MapItem | null;
  onItemSelect: (item: MapItem) => void;
}

function makeSvgIcon(emoji: string, color: string, size: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${color}"/><text x="${size / 2}" y="${size * 0.7}" text-anchor="middle" fill="white" font-size="${size * 0.5}" font-family="sans-serif">${emoji}</text></svg>`;
  return new L.Icon({
    iconUrl: "data:image/svg+xml;base64," + btoa(svg),
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

function MapController({
  center,
  zoom,
}: {
  center: { lat: number; lng: number };
  zoom: number;
}) {
  const map = useMap();
  const prevCenter = useRef(center);
  const prevZoom = useRef(zoom);

  useEffect(() => {
    if (
      prevCenter.current.lat !== center.lat ||
      prevCenter.current.lng !== center.lng ||
      prevZoom.current !== zoom
    ) {
      map.flyTo([center.lat, center.lng], zoom, { duration: 1 });
      prevCenter.current = center;
      prevZoom.current = zoom;
    }
  }, [map, center, zoom]);

  return null;
}

export default function MapView({
  items,
  center,
  zoom,
  selectedItem,
  onItemSelect,
}: MapViewProps) {
  const hotelIcon = useMemo(() => makeSvgIcon("H", "hsl(221, 83%, 53%)", 32), []);
  const activityIcon = useMemo(() => makeSvgIcon("A", "hsl(142, 71%, 45%)", 32), []);
  const selectedMarkerIcon = useMemo(() => makeSvgIcon("!", "hsl(0, 84%, 60%)", 40), []);

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      className="w-full h-full z-0"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController center={center} zoom={zoom} />

      {items.map((item) => (
        <Marker
          key={`${item.type}-${item.id}`}
          position={[item.latitude, item.longitude]}
          icon={
            selectedItem?.id === item.id
              ? selectedMarkerIcon
              : item.type === "property"
                ? hotelIcon
                : activityIcon
          }
          eventHandlers={{
            click: () => onItemSelect(item),
          }}
        >
          <Popup>
            <div className="min-w-[180px]">
              <p className="font-semibold text-sm">{item.name}</p>
              <p className="text-xs text-gray-500 capitalize">{item.type}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs">&#11088; {item.rating}</span>
                <span className="text-sm font-semibold">
                  USD {item.price}
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
