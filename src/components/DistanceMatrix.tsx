
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

  // Inverser l'ordre des colonnes
  const reversedLocations = [...locations].reverse();

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
              <TableHead className="min-w-[120px] bg-blue-50 font-medium">From \ To</TableHead>
              {reversedLocations.map((location, index) => (
                <TableHead key={index} className="min-w-[120px] bg-blue-50 font-medium">
                  {location.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((fromLocation, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell className="font-medium bg-blue-50">
                  {fromLocation.name}
                </TableCell>
                {reversedLocations.map((toLocation, colIndex) => {
                  // Trouver l'index original de la colonne inversée
                  const originalColIndex = locations.length - 1 - colIndex;
                  return (
                    <TableCell 
                      key={colIndex}
                      className={rowIndex === originalColIndex ? "bg-gray-100" : ""}
                    >
                      {rowIndex === originalColIndex ? "-" : distanceMatrix[rowIndex][originalColIndex].toFixed(2)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DistanceMatrix;
