import { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader, Search, MapPin } from "lucide-react";
import { toast } from "sonner";

interface GooglePlacesSearchProps {
  onLocationSelect: (name: string, lat: number, lng: number, address: string) => void;
  isGoogleMapsLoaded?: boolean;
}

const GooglePlacesSearch = ({ onLocationSelect, isGoogleMapsLoaded }: GooglePlacesSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isGoogleMapsLoaded && window.google) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      // Créer un div temporaire pour PlacesService
      const tempDiv = document.createElement('div');
      const tempMap = new window.google.maps.Map(tempDiv);
      placesServiceRef.current = new window.google.maps.places.PlacesService(tempMap);
    }
  }, [isGoogleMapsLoaded]);

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    
    if (!value.trim() || !autocompleteServiceRef.current) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    // Recherche avec Google Places Autocomplete
    autocompleteServiceRef.current.getPlacePredictions(
      {
        input: value,
        componentRestrictions: { country: 'dz' }, // Restreindre à l'Algérie
      },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setPredictions(predictions.slice(0, 5)); // Limiter à 5 résultats
          setShowPredictions(true);
        } else {
          setPredictions([]);
          setShowPredictions(false);
        }
      }
    );
  };

  const handlePredictionSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesServiceRef.current) return;

    setIsSearching(true);
    setShowPredictions(false);
    setSearchQuery(prediction.description);

    placesServiceRef.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['name', 'geometry', 'formatted_address']
      },
      (place, status) => {
        setIsSearching(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const name = place.name || prediction.structured_formatting.main_text;
          const address = place.formatted_address || prediction.description;

          onLocationSelect(name, lat, lng, address);
          toast.success(`Emplacement ajouté : ${name}`);
          setSearchQuery("");
        } else {
          toast.error("Erreur lors de la récupération des détails du lieu");
        }
      }
    );
  };

  const handleManualSearch = () => {
    if (!searchQuery.trim() || !isGoogleMapsLoaded) {
      toast.error("Veuillez saisir un terme de recherche");
      return;
    }

    // Si on a des prédictions, sélectionner la première
    if (predictions.length > 0) {
      handlePredictionSelect(predictions[0]);
    }
  };

  if (!isGoogleMapsLoaded) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Recherche d'emplacement</label>
        <div className="flex gap-2">
          <Input
            placeholder="Configurez d'abord Google Maps pour utiliser la recherche"
            disabled
            className="flex-1"
          />
          <Button disabled variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          La recherche Google Places sera disponible après la configuration de l'API
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 relative">
      <label className="text-sm font-medium">Recherche Google Places</label>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            placeholder="Rechercher un lieu en Algérie..."
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
            onFocus={() => predictions.length > 0 && setShowPredictions(true)}
            onBlur={() => setTimeout(() => setShowPredictions(false), 200)}
          />
          
          {showPredictions && predictions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1">
              {predictions.map((prediction) => (
                <button
                  key={prediction.place_id}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                  onClick={() => handlePredictionSelect(prediction)}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">
                        {prediction.structured_formatting.main_text}
                      </div>
                      <div className="text-xs text-gray-500">
                        {prediction.structured_formatting.secondary_text}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <Button 
          onClick={handleManualSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSearching ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <p className="text-xs text-gray-500">
        Recherche alimentée par Google Places API
      </p>
    </div>
  );
};

export default GooglePlacesSearch;
