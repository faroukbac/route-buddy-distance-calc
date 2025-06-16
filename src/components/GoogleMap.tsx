import { useState, useEffect, useRef } from 'react';
import { Loader } from "@googlemaps/js-api-loader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Settings } from "lucide-react";
import { toast } from "sonner";
import { Location } from "@/types/location";

interface GoogleMapProps {
  locations: Location[];
  onLocationClick?: (location: Location) => void;
}

const GoogleMap = ({ locations, onLocationClick }: GoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showApiInput, setShowApiInput] = useState(true);

  const initializeMap = async (key: string) => {
    if (!mapRef.current) return;

    try {
      const loader = new Loader({
        apiKey: key,
        version: "weekly",
        libraries: ["places", "geometry"]
      });

      await loader.load();

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 6,
        center: { lat: 28.0339, lng: 1.6596 }, // Centre de l'Algérie
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });

      mapInstanceRef.current = map;
      setIsMapLoaded(true);
      setShowApiInput(false);
      toast.success("Google Maps chargé avec succès !");

      // Ajouter les marqueurs existants
      updateMarkers();

    } catch (error) {
      console.error("Erreur lors du chargement de Google Maps:", error);
      toast.error("Erreur lors du chargement de Google Maps. Vérifiez votre clé API.");
    }
  };

  const updateMarkers = () => {
    if (!mapInstanceRef.current) return;

    // Supprimer les anciens marqueurs
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (locations.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();

    // Créer de nouveaux marqueurs
    locations.forEach((location, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: mapInstanceRef.current,
        title: location.name,
        animation: window.google.maps.Animation.DROP,
      });

      // InfoWindow pour chaque marqueur
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="font-family: Arial, sans-serif;">
            <h3 style="margin: 0 0 5px 0; color: #1f2937;">${location.name}</h3>
            ${location.address ? `<p style="margin: 0; color: #6b7280; font-size: 12px;">${location.address}</p>` : ''}
            <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 11px;">
              ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}
            </p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
        onLocationClick?.(location);
      });

      markersRef.current.push(marker);
      bounds.extend(marker.getPosition()!);
    });

    // Ajuster la vue pour inclure tous les marqueurs
    if (locations.length > 1) {
      mapInstanceRef.current.fitBounds(bounds);
    } else if (locations.length === 1) {
      mapInstanceRef.current.setCenter({ lat: locations[0].lat, lng: locations[0].lng });
      mapInstanceRef.current.setZoom(12);
    }
  };

  useEffect(() => {
    updateMarkers();
  }, [locations]);

  const handleApiKeySubmit = () => {
    if (!apiKey.trim()) {
      toast.error("Veuillez saisir votre clé API Google Maps");
      return;
    }
    initializeMap(apiKey);
  };

  if (showApiInput) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Configuration Google Maps
          </CardTitle>
          <CardDescription>
            Entrez votre clé API Google Maps pour activer la carte interactive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Clé API Google Maps</label>
            <Input
              placeholder="Entrez votre clé API Google Maps"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type="password"
            />
            <p className="text-xs text-gray-500">
              Obtenez votre clé API sur{" "}
              <a 
                href="https://console.cloud.google.com/google/maps-apis" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google Cloud Console
              </a>
            </p>
          </div>
          <Button 
            onClick={handleApiKeySubmit}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurer Google Maps
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Carte Google Maps
        </CardTitle>
        <CardDescription>
          Carte interactive avec {locations.length} emplacement(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          ref={mapRef}
          className="w-full h-96 rounded-lg border border-gray-200"
          style={{ minHeight: '400px' }}
        />
        
        {locations.length === 0 && isMapLoaded && (
          <div className="mt-4 text-center text-gray-500">
            Ajoutez des emplacements pour les voir sur la carte
          </div>
        )}
        
        <div className="mt-2 flex justify-between items-center text-sm text-gray-600">
          <span>{locations.length} emplacement(s) affiché(s)</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowApiInput(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Changer la clé API
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleMap;
