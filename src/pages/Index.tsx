
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Upload, DownloadCloud, Calculator } from "lucide-react";
import LocationsInput from "@/components/LocationsInput";
import DistanceMatrix from "@/components/DistanceMatrix";
import { toast } from "sonner";
import { useLocationData } from "@/hooks/use-location-data";

const Index = () => {
  const [activeTab, setActiveTab] = useState("locations");
  const { 
    locations, 
    addLocation, 
    removeLocation, 
    clearLocations, 
    distanceMatrix, 
    calculateDistances,
    isCalculating
  } = useLocationData();

  const handleCalculateClick = async () => {
    if (locations.length < 2) {
      toast.error("You need at least 2 locations to calculate distances.");
      return;
    }
    
    try {
      await calculateDistances();
      toast.success("Distance calculation complete!");
      setActiveTab("results");
    } catch (error) {
      toast.error("Failed to calculate distances. Please try again.");
      console.error(error);
    }
  };

  const handleExport = () => {
    if (!distanceMatrix || distanceMatrix.length === 0) {
      toast.error("No data to export.");
      return;
    }

    // Create CSV content
    const headers = [""].concat(locations.map(loc => loc.name));
    const rows = locations.map((loc, i) => {
      return [loc.name].concat(distanceMatrix[i].map(d => d.toFixed(2)));
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Prepare filename with date
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `distance_matrix_${date}.csv`);
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Export successful!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-3xl md:text-4xl font-bold text-blue-800">Route Buddy</h1>
          </div>
          <p className="text-lg text-blue-600">Distance Calculator</p>
        </header>

        <Card className="shadow-lg border-blue-100">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-xl text-blue-700">Calculate Routes Between Locations</CardTitle>
            <CardDescription>
              Add locations, calculate distances, and export the results
            </CardDescription>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="locations" className="data-[state=active]:bg-blue-100">
                  <Upload className="h-4 w-4 mr-2" />
                  Input Locations
                </TabsTrigger>
                <TabsTrigger value="results" className="data-[state=active]:bg-blue-100">
                  <Calculator className="h-4 w-4 mr-2" />
                  Results
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="locations" className="p-0 mt-0">
              <CardContent className="pt-6">
                <LocationsInput 
                  locations={locations}
                  onAddLocation={addLocation}
                  onRemoveLocation={removeLocation}
                  onClearLocations={clearLocations}
                />
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4 pb-4">
                <Button variant="outline" onClick={clearLocations}>Clear All</Button>
                <Button 
                  onClick={handleCalculateClick} 
                  disabled={locations.length < 2 || isCalculating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isCalculating ? "Calculating..." : "Calculate Distances"}
                </Button>
              </CardFooter>
            </TabsContent>

            <TabsContent value="results" className="p-0 mt-0">
              <CardContent className="pt-6">
                <DistanceMatrix locations={locations} distanceMatrix={distanceMatrix} />
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4 pb-4">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("locations")}
                >
                  Edit Locations
                </Button>
                <Button 
                  onClick={handleExport} 
                  disabled={!distanceMatrix || distanceMatrix.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <DownloadCloud className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardFooter>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Index;
