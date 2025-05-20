import { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader, Navigation, FileJson, Upload } from "lucide-react";
import { toast } from "sonner";
import { Location, LocationsFile } from "@/types/location";

interface LocationSearchProps {
  onLocationSelect: (name: string, lat: number, lng: number, address: string) => void;
}

const LocationSearch = ({ onLocationSelect }: LocationSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a location to search");
      return;
    }

    setIsSearching(true);
    try {
      // In a real implementation, this would call a geocoding API
      // For demonstration, we'll simulate a search with random coordinates nearby
      setTimeout(() => {
        const randomLat = 40 + (Math.random() * 10 - 5);
        const randomLng = -74 + (Math.random() * 10 - 5);
        
        onLocationSelect(
          searchQuery, 
          randomLat, 
          randomLng,
          `${searchQuery}, Simulated Address`
        );
        
        toast.success(`Found location: ${searchQuery}`);
        setSearchQuery("");
        setIsSearching(false);
      }, 1000);
    } catch (error) {
      toast.error("Failed to find location");
      setIsSearching(false);
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation(position);
        toast.success("Got your current location!");
        onLocationSelect(
          "My Location", 
          position.coords.latitude, 
          position.coords.longitude,
          "Current Location"
        );
        setIsGettingLocation(false);
      },
      (error) => {
        toast.error(`Error getting location: ${error.message}`);
        setIsGettingLocation(false);
      }
    );
  };

  const handleJsonFileSelect = () => {
    if (jsonFileInputRef.current) {
      jsonFileInputRef.current.click();
    }
  };

  const handleCsvFileSelect = () => {
    if (csvFileInputRef.current) {
      csvFileInputRef.current.click();
    }
  };

  const handleJsonFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as LocationsFile;
        
        if (!data.locations || !Array.isArray(data.locations)) {
          toast.error("Invalid JSON format. Expected 'locations' array.");
          return;
        }

        const validLocations = data.locations.filter(loc => {
          const isValid = loc.name && typeof loc.lat === 'number' && typeof loc.lng === 'number';
          return isValid;
        });

        if (validLocations.length === 0) {
          toast.error("No valid locations found in the file.");
          return;
        }

        validLocations.forEach(loc => {
          onLocationSelect(
            loc.name,
            loc.lat,
            loc.lng,
            loc.address || `${loc.name}, Imported location`
          );
        });

        toast.success(`Imported ${validLocations.length} locations from JSON`);
        
        // Reset the file input so the same file can be selected again
        if (event.target) {
          event.target.value = '';
        }

      } catch (error) {
        toast.error("Failed to parse JSON file. Please check the file format.");
        console.error("File parse error:", error);
      }
    };

    reader.readAsText(file);
  };

  const handleCsvFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length === 0) {
          toast.error("CSV file is empty.");
          return;
        }
        
        let importedCount = 0;
        let errorCount = 0;

        // Process each line
        lines.forEach((line, index) => {
          // Skip header row if it exists (it should have text headers, not numbers)
          const isHeader = index === 0 && !/^[\d\.\-\,\s]*$/.test(line);
          if (isHeader) return;

          // Split by comma
          const parts = line.split(',').map(part => part.trim());
          
          // Expect: name, lat, lng, optional address
          if (parts.length < 3) {
            errorCount++;
            return;
          }

          const name = parts[0].replace(/^"|"$/g, ''); // Remove quotes if present
          const lat = parseFloat(parts[1]);
          const lng = parseFloat(parts[2]);
          const address = parts.length > 3 ? parts.slice(3).join(', ').replace(/^"|"$/g, '') : '';

          // Validate coordinates
          if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            errorCount++;
            return;
          }

          onLocationSelect(
            name,
            lat,
            lng,
            address || `${name}, Imported location`
          );
          
          importedCount++;
        });

        if (importedCount > 0) {
          toast.success(`Imported ${importedCount} locations from CSV`);
        } else {
          toast.error("No valid locations found in CSV");
        }
        
        if (errorCount > 0) {
          toast.warning(`${errorCount} locations had invalid format and were skipped`);
        }
        
        // Reset the file input
        if (event.target) {
          event.target.value = '';
        }

      } catch (error) {
        toast.error("Failed to parse CSV file. Please check the file format.");
        console.error("CSV parse error:", error);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Search for a location</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Enter a location name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch} 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSearching}
          >
            {isSearching ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Button 
          onClick={getUserLocation} 
          variant="outline" 
          className="w-full"
          disabled={isGettingLocation}
        >
          {isGettingLocation ? (
            <Loader className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4 mr-2" />
          )}
          Use my current location
        </Button>

        <Button
          onClick={handleJsonFileSelect}
          variant="outline"
          className="w-full"
        >
          <FileJson className="h-4 w-4 mr-2" />
          Import JSON
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
        <Button
          onClick={handleCsvFileSelect}
          variant="outline"
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
      </div>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={jsonFileInputRef}
        onChange={handleJsonFileChange}
        accept=".json"
        className="hidden"
      />
      <input
        type="file"
        ref={csvFileInputRef}
        onChange={handleCsvFileChange}
        accept=".csv"
        className="hidden"
      />

      <div className="flex items-center justify-between">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="px-2 text-sm text-gray-500">OR</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>
    </div>
  );
};

export default LocationSearch;
