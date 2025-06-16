
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Location } from "@/types/location";

interface InteractiveMapProps {
  locations: Location[];
  onLocationClick?: (location: Location) => void;
}

const InteractiveMap = ({ locations, onLocationClick }: InteractiveMapProps) => {
  const [zoom, setZoom] = useState(1);
  const [centerX, setCenterX] = useState(0);
  const [centerY, setCenterY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Calculate bounds for all locations
  const getBounds = () => {
    if (locations.length === 0) return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
    
    const lats = locations.map(loc => loc.lat);
    const lngs = locations.map(loc => loc.lng);
    
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs)
    };
  };

  const bounds = getBounds();
  const mapWidth = 600;
  const mapHeight = 400;

  // Convert lat/lng to pixel coordinates
  const coordToPixel = (lat: number, lng: number) => {
    const latRange = bounds.maxLat - bounds.minLat || 1;
    const lngRange = bounds.maxLng - bounds.minLng || 1;
    
    const x = ((lng - bounds.minLng) / lngRange) * (mapWidth - 40) + 20;
    const y = ((bounds.maxLat - lat) / latRange) * (mapHeight - 40) + 20;
    
    return { x: x * zoom + centerX, y: y * zoom + centerY };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - centerX, y: e.clientY - centerY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setCenterX(e.clientX - dragStart.x);
      setCenterY(e.clientY - dragStart.y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setCenterX(0);
    setCenterY(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Carte Interactive
        </CardTitle>
        <CardDescription>
          Visualisez vos emplacements sur la carte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.min(zoom * 1.2, 3))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.max(zoom / 1.2, 0.5))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetView}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div 
          className="relative border-2 border-gray-200 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-green-50"
          style={{ width: mapWidth, height: mapHeight }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {locations.map((location, index) => {
            const { x, y } = coordToPixel(location.lat, location.lng);
            
            return (
              <div
                key={index}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ left: x, top: y }}
                onClick={() => onLocationClick?.(location)}
              >
                <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-lg group-hover:scale-150 transition-transform"></div>
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {location.name}
                </div>
              </div>
            );
          })}

          {locations.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              Aucun emplacement à afficher
            </div>
          )}
        </div>

        <div className="mt-2 text-sm text-gray-600">
          {locations.length} emplacement(s) • Glissez pour déplacer • Utilisez les boutons pour zoomer
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveMap;
