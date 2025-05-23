
import { useState } from "react";
import * as XLSX from "xlsx";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface Point {
  name: string;
  lat: number;
  lng: number;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;

  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function App() {
  const [points, setPoints] = useState<Point[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        const parsedPoints: Point[] = [];
        rows.slice(1).forEach((row, index) => {
          const name = row[0]?.toString().trim(); // "Location Name"
          const lat = parseFloat(row[1]?.toString().replace(',', '.'));
          const lng = parseFloat(row[2]?.toString().replace(',', '.'));

          if (!name || isNaN(lat) || isNaN(lng)) {
            console.warn(`Ligne ignorée : ${index + 2}`, row);
            return;
          }

          parsedPoints.push({ name, lat, lng });
        });

        if (parsedPoints.length === 0) {
          setErrorMessage("Aucun point valide trouvé dans le fichier.");
        } else {
          setPoints(parsedPoints);
          setErrorMessage(null);
        }
      } catch (err) {
        console.error(err);
        setErrorMessage("Erreur lors de la lecture du fichier Excel.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const distances = points.map((point, i) => {
    if (i === 0) return 0;
    return haversineDistance(points[i - 1].lat, points[i - 1].lng, point.lat, point.lng);
  });

  const totalDistance = distances.reduce((sum, d) => sum + d, 0).toFixed(2);

  const defaultIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Calculateur de Distance (Excel + Carte)</h1>
      
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="mb-4" />

      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

      {points.length > 0 && (
        <>
          <p className="mb-4 font-medium">Distance totale : {totalDistance} km</p>
          <ul className="mb-4 list-disc pl-5">
            {points.map((point, i) => (
              <li key={i}>
                {point.name} - ({point.lat}, {point.lng}) – {i > 0 ? `+${distances[i].toFixed(2)} km` : "Départ"}
              </li>
            ))}
          </ul>

          <MapContainer center={[points[0].lat, points[0].lng]} zoom={13} style={{ height: "500px", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© OpenStreetMap contributors'
            />
            {points.map((point, i) => (
              <Marker key={i} position={[point.lat, point.lng]} icon={defaultIcon}>
                <Popup>{point.name}</Popup>
              </Marker>
            ))}
            <Polyline positions={points.map((p) => [p.lat, p.lng])} color="blue" />
          </MapContainer>
        </>
      )}
    </div>
  );
}

export default App;
