
import { useState } from 'react';
import { Location } from '@/types/location';

// Simulated API function to calculate distances using the OpenRouteService API
const calculateRouteDistances = async (locations: Location[]): Promise<number[][]> => {
  // In a real implementation, you would call the OpenRouteService API here
  // This is a simulated version that creates a distance matrix based on basic calculations
  
  // Simulating API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const matrix: number[][] = [];
  
  for (let i = 0; i < locations.length; i++) {
    const row: number[] = [];
    for (let j = 0; j < locations.length; j++) {
      if (i === j) {
        // Distance to self is 0
        row.push(0);
      } else {
        // Calculate a simulated distance with a bit of randomness
        // This is using the Haversine formula for demonstration
        const distance = calculateHaversineDistance(
          locations[i].lat, 
          locations[i].lng, 
          locations[j].lat, 
          locations[j].lng
        );
        
        // Add a realistic road factor (roads are typically 20-40% longer than direct paths)
        const roadFactor = 1.2 + (Math.random() * 0.2);
        row.push(distance * roadFactor);
      }
    }
    matrix.push(row);
  }
  
  return matrix;
};

// Haversine formula to calculate the direct distance between two points on Earth
const calculateHaversineDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
};

const toRad = (value: number): number => {
  return value * Math.PI / 180;
};

export const useLocationData = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [distanceMatrix, setDistanceMatrix] = useState<number[][] | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const addLocation = (location: Location) => {
    setLocations([...locations, location]);
    // Clear distance matrix when locations change
    setDistanceMatrix(null);
  };

  const removeLocation = (index: number) => {
    const newLocations = [...locations];
    newLocations.splice(index, 1);
    setLocations(newLocations);
    // Clear distance matrix when locations change
    setDistanceMatrix(null);
  };

  const clearLocations = () => {
    setLocations([]);
    setDistanceMatrix(null);
  };

  const calculateDistances = async () => {
    if (locations.length < 2) {
      throw new Error("Need at least 2 locations to calculate distances");
    }

    setIsCalculating(true);
    
    try {
      const matrix = await calculateRouteDistances(locations);
      setDistanceMatrix(matrix);
      return matrix;
    } catch (error) {
      console.error("Error calculating distances:", error);
      throw error;
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    locations,
    addLocation,
    removeLocation,
    clearLocations,
    distanceMatrix,
    calculateDistances,
    isCalculating
  };
};
