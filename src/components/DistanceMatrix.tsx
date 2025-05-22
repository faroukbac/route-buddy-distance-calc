
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Location } from "@/types/location";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface DistanceMatrixProps {
  locations: Location[];
  distanceMatrix: number[][] | null;
}

const DistanceMatrix = ({ locations, distanceMatrix }: DistanceMatrixProps) => {
  if (!distanceMatrix || distanceMatrix.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>No data available</AlertTitle>
        <AlertDescription>
          Please calculate distances first to view the results.
        </AlertDescription>
      </Alert>
    );
  }

  // Créons une copie inversée des emplacements pour l'affichage des colonnes
  const invertedLocations = [...locations].reverse();

  return (
    <div className="space-y-4">
      <div className="border rounded-md p-4 bg-blue-50">
        <h3 className="font-medium mb-2">Distance Matrix</h3>
        <p className="text-sm text-gray-600">Distances are shown in kilometers</p>
      </div>
      
      <div className="overflow-x-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px] bg-blue-50 font-medium">To \ From</TableHead>
              {locations.map((location, index) => (
                <TableHead key={index} className="min-w-[120px] bg-blue-50 font-medium">
                  {location.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {invertedLocations.map((toLocation, rowIndex) => {
              // Trouver l'index réel dans le tableau original des emplacements
              const actualRowIndex = locations.length - 1 - rowIndex;
              
              return (
                <TableRow key={rowIndex}>
                  <TableCell className="font-medium bg-blue-50">
                    {toLocation.name}
                  </TableCell>
                  {locations.map((fromLocation, colIndex) => {
                    // Inversion de l'ordre pour l'affichage
                    const cellValue = distanceMatrix[colIndex][actualRowIndex];
                    
                    return (
                      <TableCell 
                        key={colIndex}
                        className={actualRowIndex === colIndex ? "bg-gray-100" : ""}
                      >
                        {actualRowIndex === colIndex ? "-" : cellValue.toFixed(2)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DistanceMatrix;
