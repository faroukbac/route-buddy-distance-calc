
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Location } from "@/types/location";
import LocationSearch from './LocationSearch';
import LocationConfirmDialog from './LocationConfirmDialog';

interface LocationsInputProps {
  locations: Location[];
  onAddLocation: (location: Location) => void;
  onRemoveLocation: (index: number) => void;
  onClearLocations: () => void;
}

const LocationsInput = ({ 
  locations, 
  onAddLocation, 
  onRemoveLocation, 
  onClearLocations 
}: LocationsInputProps) => {
  const [name, setName] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [isManualMode, setIsManualMode] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<Location | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleAddLocation = () => {
    // Validation
    if (!name.trim()) {
      toast.error("Veuillez saisir un nom d'emplacement");
      return;
    }

    // Parse coordinates from the single input field (format: "lat, lng")
    const coordParts = coordinates.split(',').map(part => part.trim());
    
    if (coordParts.length !== 2) {
      toast.error("Les coordonnées doivent être au format 'latitude, longitude'");
      return;
    }

    const lat = parseFloat(coordParts[0]);
    const lng = parseFloat(coordParts[1]);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Veuillez saisir des valeurs de latitude et longitude valides");
      return;
    }

    if (lat < -90 || lat > 90) {
      toast.error("La latitude doit être comprise entre -90 et 90");
      return;
    }

    if (lng < -180 || lng > 180) {
      toast.error("La longitude doit être comprise entre -180 et 180");
      return;
    }

    // Set pending location and show confirmation dialog
    setPendingLocation({ name, lat, lng });
    setShowConfirmDialog(true);
  };

  const handleLocationSelect = (name: string, lat: number, lng: number, address: string) => {
    // Set pending location and show confirmation dialog
    setPendingLocation({ name, lat, lng, address });
    setShowConfirmDialog(true);
  };

  const handleConfirmLocation = () => {
    if (pendingLocation) {
      onAddLocation(pendingLocation);
      
      // Clear inputs if it was manual entry
      if (isManualMode) {
        setName("");
        setCoordinates("");
      }
      
      // Close dialog and clear pending location
      setShowConfirmDialog(false);
      setPendingLocation(null);
      
      toast.success(`Emplacement ajouté: ${pendingLocation.name}`);
    }
  };

  const handleCancelLocation = () => {
    // Close dialog and clear pending location
    setShowConfirmDialog(false);
    setPendingLocation(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 py-2">
        <div className="mb-4">
          <div className="flex justify-between mb-4">
            <Button 
              variant={isManualMode ? "outline" : "default"} 
              onClick={() => setIsManualMode(false)}
              size="sm"
              className={!isManualMode ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Rechercher un emplacement
            </Button>
            <Button 
              variant={isManualMode ? "default" : "outline"} 
              onClick={() => setIsManualMode(true)}
              size="sm"
              className={isManualMode ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              <Plus className="h-4 w-4 mr-2" />
              Saisie manuelle
            </Button>
          </div>
          
          {isManualMode ? (
            <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
              <div>
                <Label htmlFor="name">Nom de l'emplacement</Label>
                <Input
                  id="name"
                  placeholder="Entrer le nom de l'emplacement"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="coordinates">Coordonnées (lat, lng)</Label>
                <Input
                  id="coordinates"
                  placeholder="ex: 35.33151545340188, -0.26259614606690074"
                  value={coordinates}
                  onChange={(e) => setCoordinates(e.target.value)}
                />
              </div>
              <div className="md:col-span-3">
                <Button 
                  onClick={handleAddLocation} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" /> Ajouter
                </Button>
              </div>
            </div>
          ) : (
            <LocationSearch onLocationSelect={handleLocationSelect} />
          )}
        </div>
      </div>

      <div className="border rounded-md">
        <div className="bg-blue-50 px-4 py-2 border-b">
          <h3 className="font-medium">Emplacements ajoutés ({locations.length})</h3>
        </div>
        <div className="overflow-y-auto max-h-80">
          {locations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun emplacement ajouté. Ajoutez votre premier emplacement ci-dessus.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Nom</th>
                  <th className="px-4 py-2 text-center">Coordonnées</th>
                  <th className="px-4 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {locations.map((loc, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-left">
                      <div>
                        <span className="font-medium">{loc.name}</span>
                        {loc.address && (
                          <p className="text-xs text-gray-500 mt-1">{loc.address}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      {loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveLocation(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <LocationConfirmDialog 
        location={pendingLocation}
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmLocation}
        onCancel={handleCancelLocation}
      />
    </div>
  );
};

export default LocationsInput;
