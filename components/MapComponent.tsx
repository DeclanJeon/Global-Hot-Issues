'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

export interface Country {
  name: string;
  code: string;
  lat: number;
  lng: number;
}

const countries: Country[] = [
  { name: 'South Korea', code: 'KR', lat: 35.9078, lng: 127.7669 },
  { name: 'United States', code: 'US', lat: 37.0902, lng: -95.7129 },
  { name: 'Japan', code: 'JP', lat: 36.2048, lng: 138.2529 },
  { name: 'United Kingdom', code: 'GB', lat: 55.3781, lng: -3.4360 },
  { name: 'France', code: 'FR', lat: 46.2276, lng: 2.2137 },
  { name: 'Germany', code: 'DE', lat: 51.1657, lng: 10.4515 },
  { name: 'India', code: 'IN', lat: 20.5937, lng: 78.9629 },
  { name: 'Brazil', code: 'BR', lat: -14.2350, lng: -51.9253 },
  { name: 'Australia', code: 'AU', lat: -25.2744, lng: 133.7751 },
  { name: 'China', code: 'CN', lat: 35.8617, lng: 104.1954 },
  { name: 'Canada', code: 'CA', lat: 56.1304, lng: -106.3468 },
  { name: 'Italy', code: 'IT', lat: 41.8719, lng: 12.5674 },
  { name: 'Spain', code: 'ES', lat: 40.4637, lng: -3.7492 },
  { name: 'Mexico', code: 'MX', lat: 23.6345, lng: -102.5528 },
  { name: 'Russia', code: 'RU', lat: 61.5240, lng: 105.3188 },
  { name: 'South Africa', code: 'ZA', lat: -30.5595, lng: 22.9375 },
  { name: 'Argentina', code: 'AR', lat: -38.4161, lng: -63.6167 },
  { name: 'Egypt', code: 'EG', lat: 26.8206, lng: 30.8025 },
  { name: 'Nigeria', code: 'NG', lat: 9.0820, lng: 8.6753 },
  { name: 'Saudi Arabia', code: 'SA', lat: 23.8859, lng: 45.0792 },
];

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom);
  }, [center, zoom, map]);
  return null;
}

interface MapComponentProps {
  onSelectCountry: (country: Country) => void;
  selectedCountry: Country | null;
}

export default function MapComponent({ onSelectCountry, selectedCountry }: MapComponentProps) {
  const center: [number, number] = selectedCountry 
    ? [selectedCountry.lat, selectedCountry.lng] 
    : [20, 0];
  const zoom = selectedCountry ? 5 : 2;

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      scrollWheelZoom={true} 
      className="w-full h-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={center} zoom={zoom} />
      
      {countries.map((country) => (
        <Marker 
          key={country.code} 
          position={[country.lat, country.lng]} 
          icon={icon}
          eventHandlers={{
            click: () => onSelectCountry(country),
          }}
        >
          <Popup>
            <div className="font-semibold text-sm">{country.name}</div>
            <div className="text-xs text-gray-500">Click to view hot issues</div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
