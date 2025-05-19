
import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader, Navigation } from "lucide-react";
import { toast } from "sonner";

interface LocationSearchProps {
  onLocationSelect: (name: string, lat: number, lng: number, address: string) => void;
}

const LocationSearch = ({ onLocationSelect }: LocationSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

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

      <div className="flex items-center justify-between">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="px-2 text-sm text-gray-500">OR</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

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
    </div>
  );
};

export default LocationSearch;
