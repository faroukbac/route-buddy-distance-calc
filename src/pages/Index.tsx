
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Upload, DownloadCloud, Calculator, Map, BarChart3, Settings } from "lucide-react";
import LocationsInput from "@/components/LocationsInput";
import DistanceMatrix from "@/components/DistanceMatrix";
import InteractiveMap from "@/components/InteractiveMap";
import DistanceStatistics from "@/components/DistanceStatistics";
import ExportOptions from "@/components/ExportOptions";
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
      toast.error("Vous avez besoin d'au moins 2 emplacements pour calculer les distances.");
      return;
    }
    
    try {
      await calculateDistances();
      toast.success("Calcul des distances terminé !");
      setActiveTab("results");
    } catch (error) {
      toast.error("Échec du calcul des distances. Veuillez réessayer.");
      console.error(error);
    }
  };

  const handleLocationClick = (location: any) => {
    toast.info(`Emplacement sélectionné : ${location.name}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-3xl md:text-4xl font-bold text-blue-800">Route Buddy</h1>
          </div>
          <p className="text-lg text-blue-600">Calculateur de Distance Avancé</p>
        </header>

        <Card className="shadow-lg border-blue-100">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-xl text-blue-700">Calculer les Itinéraires Entre Emplacements</CardTitle>
            <CardDescription>
              Ajoutez des emplacements, calculez les distances, visualisez sur une carte et exportez les résultats
            </CardDescription>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="locations" className="data-[state=active]:bg-blue-100">
                  <Upload className="h-4 w-4 mr-2" />
                  Emplacements
                </TabsTrigger>
                <TabsTrigger value="map" className="data-[state=active]:bg-blue-100">
                  <Map className="h-4 w-4 mr-2" />
                  Carte
                </TabsTrigger>
                <TabsTrigger value="results" className="data-[state=active]:bg-blue-100">
                  <Calculator className="h-4 w-4 mr-2" />
                  Résultats
                </TabsTrigger>
                <TabsTrigger value="statistics" className="data-[state=active]:bg-blue-100">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Statistiques
                </TabsTrigger>
                <TabsTrigger value="export" className="data-[state=active]:bg-blue-100">
                  <DownloadCloud className="h-4 w-4 mr-2" />
                  Export
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
                <Button variant="outline" onClick={clearLocations}>Effacer Tout</Button>
                <Button 
                  onClick={handleCalculateClick} 
                  disabled={locations.length < 2 || isCalculating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isCalculating ? "Calcul en cours..." : "Calculer les Distances"}
                </Button>
              </CardFooter>
            </TabsContent>

            <TabsContent value="map" className="p-6">
              <InteractiveMap 
                locations={locations} 
                onLocationClick={handleLocationClick}
              />
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
                  Modifier les Emplacements
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab("statistics")}
                    disabled={!distanceMatrix}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Voir Statistiques
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("export")}
                    disabled={!distanceMatrix}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <DownloadCloud className="h-4 w-4 mr-2" />
                    Exporter
                  </Button>
                </div>
              </CardFooter>
            </TabsContent>

            <TabsContent value="statistics" className="p-6">
              <DistanceStatistics locations={locations} distanceMatrix={distanceMatrix} />
            </TabsContent>

            <TabsContent value="export" className="p-6">
              <ExportOptions locations={locations} distanceMatrix={distanceMatrix} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Index;
