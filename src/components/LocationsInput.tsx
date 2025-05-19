
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash, MapPin } from "lucide-react";
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
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isManualMode, setIsManualMode] = useState(false);

  const handleAddLocation = () => {
    // Validation
    if (!name.trim()) {
      toast.error("Please enter a location name");
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

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
    setLatitude("");
    setLongitude("");
    
    toast.success(`Added location: ${name}`);
  };

  const handleLocationSelect = (name: string, lat: number, lng: number, address: string) => {
    onAddLocation({ name, lat, lng, address });
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
            <div className="grid gap-3 grid-cols-1 md:grid-cols-5">
              <div className="md:col-span-2">
                <Label htmlFor="name">Location Name</Label>
                <Input
                  id="name"
                  placeholder="Enter location name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  placeholder="e.g. 48.8566"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  placeholder="e.g. 2.3522"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                />
              </div>
              <div className="flex items-end">
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
