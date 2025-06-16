
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, MapPin, Route } from "lucide-react";
import { Location } from "@/types/location";

interface DistanceStatisticsProps {
  locations: Location[];
  distanceMatrix: number[][] | null;
}

const DistanceStatistics = ({ locations, distanceMatrix }: DistanceStatisticsProps) => {
  if (!distanceMatrix || distanceMatrix.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Statistiques
          </CardTitle>
          <CardDescription>
            Les statistiques apparaîtront après le calcul des distances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Calculez d'abord les distances pour voir les statistiques
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculer les statistiques
  const allDistances = distanceMatrix.flat().filter(d => d > 0);
  const minDistance = Math.min(...allDistances);
  const maxDistance = Math.max(...allDistances);
  const avgDistance = allDistances.reduce((a, b) => a + b, 0) / allDistances.length;
  const totalDistance = allDistances.reduce((a, b) => a + b, 0);

  // Trouver les paires avec distances min/max
  let minPair = { from: '', to: '', distance: minDistance };
  let maxPair = { from: '', to: '', distance: maxDistance };

  for (let i = 0; i < distanceMatrix.length; i++) {
    for (let j = 0; j < distanceMatrix[i].length; j++) {
      if (i !== j) {
        const distance = distanceMatrix[i][j];
        if (distance === minDistance) {
          minPair = { from: locations[i].name, to: locations[j].name, distance };
        }
        if (distance === maxDistance) {
          maxPair = { from: locations[i].name, to: locations[j].name, distance };
        }
      }
    }
  }

  const stats = [
    {
      title: "Distance minimale",
      value: `${minDistance.toFixed(2)} km`,
      subtitle: `${minPair.from} → ${minPair.to}`,
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Distance maximale",
      value: `${maxDistance.toFixed(2)} km`,
      subtitle: `${maxPair.from} → ${maxPair.to}`,
      icon: Route,
      color: "text-red-600"
    },
    {
      title: "Distance moyenne",
      value: `${avgDistance.toFixed(2)} km`,
      subtitle: `Sur ${allDistances.length} trajets`,
      icon: BarChart3,
      color: "text-blue-600"
    },
    {
      title: "Distance totale",
      value: `${totalDistance.toFixed(2)} km`,
      subtitle: `Somme de tous les trajets`,
      icon: MapPin,
      color: "text-purple-600"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Statistiques des Distances
        </CardTitle>
        <CardDescription>
          Analyse des {locations.length} emplacements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div className="flex-1">
                  <div className="text-sm text-gray-600">{stat.title}</div>
                  <div className="text-lg font-semibold">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.subtitle}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t">
          <h4 className="font-medium mb-3">Répartition des distances</h4>
          <div className="space-y-2">
            {[
              { range: "0-10 km", count: allDistances.filter(d => d <= 10).length },
              { range: "10-50 km", count: allDistances.filter(d => d > 10 && d <= 50).length },
              { range: "50-100 km", count: allDistances.filter(d => d > 50 && d <= 100).length },
              { range: "100+ km", count: allDistances.filter(d => d > 100).length }
            ].map((range, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm">{range.range}</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="h-2 bg-blue-200 rounded"
                    style={{ 
                      width: `${Math.max((range.count / allDistances.length) * 100, 5)}px`
                    }}
                  ></div>
                  <span className="text-sm font-medium">{range.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DistanceStatistics;
