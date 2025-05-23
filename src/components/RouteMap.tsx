
import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Set up default icon for markers once
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Point {
  name: string;
  lat: number;
  lng: number;
}

interface RouteMapProps {
  points: Point[];
}

const RouteMap = ({ points }: RouteMapProps) => {
  // Only render map if there are points
  if (points.length === 0) {
    return null;
  }

  const mapCenter = useMemo(() => {
    return [points[0].lat, points[0].lng] as [number, number];
  }, [points]);

  const linePositions = useMemo(() => {
    return points.map((p) => [p.lat, p.lng] as [number, number]);
  }, [points]);

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer 
        style={{ height: "100%", width: "100%" }}
        center={mapCenter}
        zoom={13}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        
        {points.map((point, i) => (
          <Marker key={i} position={[point.lat, point.lng] as [number, number]}>
            <Popup>{point.name}</Popup>
          </Marker>
        ))}
        
        <Polyline 
          pathOptions={{ color: 'blue' }} 
          positions={linePositions}
        />
      </MapContainer>
    </div>
  );
};

export default RouteMap;
