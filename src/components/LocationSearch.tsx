import { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader, Navigation, FileJson, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { Location, LocationsFile } from "@/types/location";
import * as XLSX from 'xlsx';

interface LocationSearchProps {
  onLocationSelect: (name: string, lat: number, lng: number, address: string) => void;
}

const LocationSearch = ({ onLocationSelect }: LocationSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const excelFileInputRef = useRef<HTMLInputElement>(null);

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

  const handleExcelFileSelect = () => {
    if (excelFileInputRef.current) {
      excelFileInputRef.current.click();
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

  const handleExcelFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert the worksheet to JSON
        const excelData = XLSX.utils.sheet_to_json<{ 
          'Location Name': string, 
          'Coordinates (lat, lng)': string 
        }>(worksheet);
        
        if (excelData.length === 0) {
          toast.error("Aucune donnée trouvée dans le fichier Excel");
          return;
        }

        let importedCount = 0;
        let errorCount = 0;

        // Process each row individually
        excelData.forEach((row, index) => {
          const locationName = row['Location Name'];
          const coordinatesStr = row['Coordinates (lat, lng)'];
          
          // Skip empty rows
          if (!locationName || !coordinatesStr) {
            errorCount++;
            console.error(`Ligne ${index + 1}: Nom ou coordonnées manquants`);
            return;
          }
          
          // Parse coordinates
          const coordParts = coordinatesStr.split(',').map(part => part.trim());
          
          if (coordParts.length !== 2) {
            errorCount++;
            console.error(`Ligne ${index + 1}: Format de coordonnées invalide: ${coordinatesStr}`);
            return;
          }

          const lat = parseFloat(coordParts[0]);
          const lng = parseFloat(coordParts[1]);

          // Validate coordinates
          if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            errorCount++;
            console.error(`Ligne ${index + 1}: Coordonnées hors limites: lat=${lat}, lng=${lng}`);
            return;
          }

          // Add this location to the map
          onLocationSelect(
            locationName,
            lat,
            lng,
            `${locationName}, Emplacement importé`
          );
          
          importedCount++;
          console.log(`Ligne ${index + 1} importée: ${locationName} (${lat}, ${lng})`);
        });

        if (importedCount > 0) {
          toast.success(`${importedCount} emplacements importés depuis Excel`);
        } else {
          toast.error("Aucun emplacement valide trouvé dans le fichier Excel");
        }
        
        if (errorCount > 0) {
          toast.warning(`${errorCount} emplacements ont un format invalide et ont été ignorés`);
        }
        
        // Reset the file input
        if (event.target) {
          event.target.value = '';
        }

      } catch (error) {
        toast.error("Échec de l'analyse du fichier Excel. Veuillez vérifier le format du fichier.");
        console.error("Erreur d'analyse Excel:", error);
      }
    };

    reader.readAsArrayBuffer(file);
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
          onClick={handleExcelFileSelect}
          variant="outline"
          className="w-full"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Import Excel
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
        ref={excelFileInputRef}
        onChange={handleExcelFileChange}
        accept=".xlsx,.xls"
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
