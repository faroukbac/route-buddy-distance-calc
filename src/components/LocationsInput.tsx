
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash, MapPin, Import } from "lucide-react";
import { toast } from "sonner";
import { Location } from "@/types/location";
import LocationSearch from './LocationSearch';

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

  const handleAddLocation = () => {
    // Validation
    if (!name.trim()) {
      toast.error("Please enter a location name");
      return;
    }

    // Parse coordinates from the single input field (format: "lat, lng")
    const coordParts = coordinates.split(',').map(part => part.trim());
    
    if (coordParts.length !== 2) {
      toast.error("Coordinates must be in the format 'latitude, longitude'");
      return;
    }

    const lat = parseFloat(coordParts[0]);
    const lng = parseFloat(coordParts[1]);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Please enter valid latitude and longitude values");
      return;
    }

    if (lat < -90 || lat > 90) {
      toast.error("Latitude must be between -90 and 90");
      return;
    }

    if (lng < -180 || lng > 180) {
      toast.error("Longitude must be between -180 and 180");
      return;
    }

    // Add location
    onAddLocation({ name, lat, lng });
    
    // Clear inputs
    setName("");
    setCoordinates("");
    
    toast.success(`Added location: ${name}`);
  };

  const handleLocationSelect = (name: string, lat: number, lng: number, address: string) => {
    onAddLocation({ name, lat, lng, address });
  };
  
  const handleAddPresetLocations = () => {
    const presetLocations = [
      { name: "Aïn El Berd", coordinates: [35.37104738026323, -0.5148264491643942] },
      { name: "Aïn Kada", coordinates: [35.2500, -0.6000] },
      { name: "Aïn Thrid", coordinates: [35.285387122813944, -0.6752855301489279] },
      { name: "Aïn Tindamine", coordinates: [34.690155547289706, -0.7213569771727453] },
      { name: "Amarnas", coordinates: [35.142768864003905, -0.6249537153778579] },
      { name: "Badredine El Mokrani", coordinates: [35.2400, -0.6100] },
      { name: "Belarbi", coordinates: [35.1800, -0.6400] },
      { name: "Ben Badis", coordinates: [35.1719, -0.7554] },
      { name: "Benachiba Chelia", coordinates: [35.1900, -0.6300] },
      { name: "Bir El Hammam", coordinates: [35.2600, -0.6000] },
      { name: "Boudjebaa El Bordj", coordinates: [35.2700, -0.6100] },
      { name: "Boukhanafis", coordinates: [35.2800, -0.6200] },
      { name: "Chettouane Belaila", coordinates: [35.2900, -0.6300] },
      { name: "Dhaya", coordinates: [35.3000, -0.6400] },
      { name: "El Haçaiba", coordinates: [35.3100, -0.6500] },
      { name: "Hassi Dahou", coordinates: [35.3200, -0.6600] },
      { name: "Hassi Zehana", coordinates: [35.3300, -0.6700] },
      { name: "Lamtar", coordinates: [35.3400, -0.6800] },
      { name: "Makedra", coordinates: [35.0621, -0.5487] },
      { name: "Marhoum", coordinates: [34.8000, -0.7000] },
      { name: "M'Cid", coordinates: [35.3500, -0.6900] },
      { name: "Merine", coordinates: [35.3600, -0.7000] },
      { name: "Mezaourou", coordinates: [35.3700, -0.7100] },
      { name: "Mostefa Ben Brahim", coordinates: [35.3800, -0.7200] },
      { name: "Moulay Slissen", coordinates: [35.3900, -0.7300] },
      { name: "Oued Sebaa", coordinates: [35.4000, -0.7400] },
      { name: "Oued Sefioun", coordinates: [35.4100, -0.7500] },
      { name: "Oued Taourira", coordinates: [35.4200, -0.7600] },
      { name: "Ras El Ma", coordinates: [35.4300, -0.7700] },
      { name: "Redjem Demouche", coordinates: [35.4400, -0.7800] },
      { name: "Sehala Thaoura", coordinates: [35.4500, -0.7900] },
      { name: "Sfisef", coordinates: [35.2344, -0.2434] },
      { name: "Sidi Ali Benyoub", coordinates: [35.4600, -0.8000] },
      { name: "Sidi Ali Boussidi", coordinates: [35.4700, -0.8100] },
      { name: "Sidi Bel Abbès", coordinates: [35.1939, -0.6414] },
      { name: "Sidi Brahim", coordinates: [35.4800, -0.8200] },
      { name: "Sidi Chaib", coordinates: [35.4900, -0.8300] },
      { name: "Sidi Daho des Zairs", coordinates: [35.5000, -0.8400] },
      { name: "Sidi Hamadouche", coordinates: [35.5100, -0.8500] }
    ];

    // Add each location to the state
    let addedCount = 0;
    presetLocations.forEach(loc => {
      onAddLocation({
        name: loc.name,
        lat: loc.coordinates[0],
        lng: loc.coordinates[1],
        address: `${loc.name}, Algeria`
      });
      addedCount++;
    });

    toast.success(`Added ${addedCount} preset locations`);
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
              Search Location
            </Button>
            <Button 
              variant={isManualMode ? "default" : "outline"} 
              onClick={() => setIsManualMode(true)}
              size="sm"
              className={isManualMode ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              <Plus className="h-4 w-4 mr-2" />
              Manual Entry
            </Button>
          </div>
          
          {isManualMode ? (
            <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
              <div>
                <Label htmlFor="name">Location Name</Label>
                <Input
                  id="name"
                  placeholder="Enter location name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="coordinates">Coordinates (lat, lng)</Label>
                <Input
                  id="coordinates"
                  placeholder="e.g. 35.33151545340188, -0.26259614606690074"
                  value={coordinates}
                  onChange={(e) => setCoordinates(e.target.value)}
                />
              </div>
              <div className="md:col-span-3">
                <Button 
                  onClick={handleAddLocation} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
              </div>
            </div>
          ) : (
            <LocationSearch onLocationSelect={handleLocationSelect} />
          )}
        </div>
        
        <Button 
          onClick={handleAddPresetLocations} 
          variant="secondary" 
          className="w-full"
        >
          <Import className="h-4 w-4 mr-2" />
          Add Algerian Locations (Sidi Bel Abbès Province)
        </Button>
      </div>

      <div className="border rounded-md">
        <div className="bg-blue-50 px-4 py-2 border-b">
          <h3 className="font-medium">Added Locations ({locations.length})</h3>
        </div>
        <div className="overflow-y-auto max-h-80">
          {locations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No locations added yet. Add your first location above.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-center">Coordinates</th>
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
    </div>
  );
};

export default LocationsInput;
