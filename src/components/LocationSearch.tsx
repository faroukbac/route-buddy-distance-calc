
import { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader, Navigation, FileJson, FileSpreadsheet, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Location, LocationsFile, algeriaLocations } from "@/types/location";
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
      // For demonstration, we'll simulate a search with random coordinates
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

  const handleExcelFileSelect = () => {
    if (excelFileInputRef.current) {
      excelFileInputRef.current.click();
    }
  };

  const handleExcelFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });
        
        if (!rawData || rawData.length === 0) {
          toast.error("Aucune donnée trouvée dans le fichier Excel");
          return;
        }

        console.log("Données brutes Excel:", rawData);

        let importCount = 0;
        let errorCount = 0;

        // Détecter si la première ligne est un en-tête
        const startRow = rawData.length > 0 && 
                        rawData[0] && 
                        typeof rawData[0][0] === 'string' && 
                        (rawData[0][0].toLowerCase().includes('nom') || 
                         rawData[0][0].toLowerCase().includes('name') ||
                         rawData[0][0].toLowerCase().includes('location')) ? 1 : 0;

        console.log("Début du traitement à la ligne:", startRow);

        for (let i = startRow; i < rawData.length; i++) {
          const row = rawData[i];
          console.log(`Traitement ligne ${i}:`, row);
          
          // Vérifier que la ligne a au moins 2 colonnes avec des données
          if (!row || row.length < 2 || !row[0] || !row[1]) {
            console.log(`Ligne ${i} ignorée - données manquantes:`, row);
            continue;
          }

          const name = String(row[0]).trim();
          const coordinatesStr = String(row[1]).trim();
          
          console.log(`Nom: "${name}", Coordonnées: "${coordinatesStr}"`);
          
          // Vérifier que le nom n'est pas vide
          if (!name) {
            console.log(`Ligne ${i} ignorée - nom vide`);
            errorCount++;
            continue;
          }

          // Séparer les coordonnées
          const coordParts = coordinatesStr.split(',');
          if (coordParts.length !== 2) {
            console.log(`Ligne ${i} ignorée - format coordonnées invalide:`, coordParts);
            errorCount++;
            continue;
          }

          const latStr = coordParts[0].trim();
          const lngStr = coordParts[1].trim();
          
          const lat = parseFloat(latStr);
          const lng = parseFloat(lngStr);

          console.log(`Lat: ${lat}, Lng: ${lng}`);

          // Valider les coordonnées
          if (isNaN(lat) || isNaN(lng)) {
            console.log(`Ligne ${i} ignorée - coordonnées NaN:`, { lat, lng });
            errorCount++;
            continue;
          }

          if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            console.log(`Ligne ${i} ignorée - coordonnées hors limites:`, { lat, lng });
            errorCount++;
            continue;
          }

          // Ajouter la localisation valide
          onLocationSelect(
            name,
            lat,
            lng,
            `${name}, Importé depuis Excel`
          );
          importCount++;
          console.log(`Ligne ${i} importée avec succès: ${name}`);
        }

        if (importCount > 0) {
          toast.success(`${importCount} emplacements importés avec succès`);
        }
        if (errorCount > 0) {
          toast.warning(`${errorCount} lignes ignorées à cause de données invalides`);
        }
        if (importCount === 0) {
          toast.error("Aucun emplacement valide trouvé dans le fichier");
        }

        // Réinitialiser l'input fichier
        if (event.target) {
          event.target.value = '';
        }

      } catch (error) {
        console.error('Erreur lors du traitement du fichier Excel:', error);
        toast.error("Erreur lors du traitement du fichier Excel. Vérifiez le format.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const importAlgeriaLocations = () => {
    if (algeriaLocations.length === 0) {
      toast.error("No predefined locations available");
      return;
    }

    let importCount = 0;
    algeriaLocations.forEach(location => {
      onLocationSelect(
        location.name,
        location.lat,
        location.lng,
        `${location.name}, Algeria`
      );
      importCount++;
    });

    toast.success(`Imported ${importCount} locations from Algeria`);
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Button
          onClick={handleExcelFileSelect}
          variant="outline"
          className="w-full"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Import Excel
        </Button>
        
        <Button
          onClick={importAlgeriaLocations}
          variant="outline"
          className="w-full"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Import Algeria Locations
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
