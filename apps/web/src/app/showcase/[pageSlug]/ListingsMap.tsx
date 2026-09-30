'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Typography from '@mui/material/Typography';

// Leaflet's default marker icons reference image files in a way that
// breaks under bundlers like Turbopack. Pointing them at a CDN sidesteps
// the missing-icon problem without adding a build step.
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type MapListing = {
  id: string;
  address: string;
  price: number | null;
  latitude: number | null;
  longitude: number | null;
};

export default function ListingsMap({ listings }: { listings: MapListing[] }) {
  const withCoords = listings.filter(
    (l): l is MapListing & { latitude: number; longitude: number } =>
      l.latitude !== null && l.longitude !== null
  );

  if (withCoords.length === 0) return null;

  const center: [number, number] = [withCoords[0].latitude, withCoords[0].longitude];

  return (
    <MapContainer center={center} zoom={12} style={{ height: 320, width: '100%', borderRadius: 8 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {withCoords.map((l) => (
        <Marker key={l.id} position={[l.latitude, l.longitude]} icon={markerIcon}>
          <Popup>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {l.address}
            </Typography>
            {l.price && <Typography variant="caption">₱{l.price.toLocaleString()}</Typography>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}