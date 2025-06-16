
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileSpreadsheet, FileJson, FileText, Save } from "lucide-react";
import { toast } from "sonner";
import { Location } from "@/types/location";
import * as XLSX from 'xlsx';

interface ExportOptionsProps {
  locations: Location[];
  distanceMatrix: number[][] | null;
}

const ExportOptions = ({ locations, distanceMatrix }: ExportOptionsProps) => {
  const [exportFormat, setExportFormat] = useState<string>("csv");

  const generateCSV = () => {
    if (!distanceMatrix) return "";
    
    const headers = [""].concat(locations.map(loc => loc.name));
    const rows = locations.map((loc, i) => {
      return [loc.name].concat(distanceMatrix[i].map(d => d.toFixed(2)));
    });
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const generateJSON = () => {
    const data = {
      project: {
        name: "Route Buddy Project",
        created: new Date().toISOString(),
        locations: locations,
        distanceMatrix: distanceMatrix
      },
      statistics: distanceMatrix ? {
        totalLocations: locations.length,
        totalRoutes: locations.length * (locations.length - 1),
        averageDistance: distanceMatrix.flat().filter(d => d > 0).reduce((a, b) => a + b, 0) / distanceMatrix.flat().filter(d => d > 0).length
      } : null
    };
    
    return JSON.stringify(data, null, 2);
  };

  const generateExcel = () => {
    if (!distanceMatrix) return null;
    
    const wb = XLSX.utils.book_new();
    
    // Feuille 1: Matrice des distances
    const headers = [""].concat(locations.map(loc => loc.name));
    const matrixData = [headers].concat(
      locations.map((loc, i) => 
        [loc.name].concat(distanceMatrix[i].map(d => d.toFixed(2)))
      )
    );
    const ws1 = XLSX.utils.aoa_to_sheet(matrixData);
    XLSX.utils.book_append_sheet(wb, ws1, "Matrice des distances");
    
    // Feuille 2: Liste des emplacements
    const locationData = [
      ["Nom", "Latitude", "Longitude", "Adresse"],
      ...locations.map(loc => [loc.name, loc.lat, loc.lng, loc.address || ""])
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(locationData);
    XLSX.utils.book_append_sheet(wb, ws2, "Emplacements");
    
    return wb;
  };

  const handleExport = () => {
    if (!distanceMatrix) {
      toast.error("Aucune donnée à exporter. Calculez d'abord les distances.");
      return;
    }

    const date = new Date().toISOString().split('T')[0];
    
    switch (exportFormat) {
      case "csv":
        const csvContent = generateCSV();
        const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const csvUrl = URL.createObjectURL(csvBlob);
        const csvLink = document.createElement('a');
        csvLink.setAttribute('href', csvUrl);
        csvLink.setAttribute('download', `distance_matrix_${date}.csv`);
        document.body.appendChild(csvLink);
        csvLink.click();
        document.body.removeChild(csvLink);
        break;
        
      case "json":
        const jsonContent = generateJSON();
        const jsonBlob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonLink = document.createElement('a');
        jsonLink.setAttribute('href', jsonUrl);
        jsonLink.setAttribute('download', `route_buddy_project_${date}.json`);
        document.body.appendChild(jsonLink);
        jsonLink.click();
        document.body.removeChild(jsonLink);
        break;
        
      case "excel":
        const wb = generateExcel();
        if (wb) {
          XLSX.writeFile(wb, `route_buddy_${date}.xlsx`);
        }
        break;
    }
    
    toast.success("Export réussi !");
  };

  const saveProject = () => {
    const projectData = {
      name: `Projet Route Buddy ${new Date().toLocaleDateString()}`,
      locations: locations,
      distanceMatrix: distanceMatrix,
      saved: new Date().toISOString()
    };
    
    const jsonContent = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `route_buddy_project_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Projet sauvegardé !");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Options d'Export
        </CardTitle>
        <CardDescription>
          Exportez vos données dans différents formats
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Format d'export</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CSV (Excel compatible)
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel (.xlsx)
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    JSON (complet)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleExport}
            disabled={!distanceMatrix}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>

        <div className="border-t pt-4">
          <Button 
            onClick={saveProject}
            variant="outline"
            className="w-full"
            disabled={locations.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder le projet
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Sauvegardez votre projet complet pour le recharger plus tard
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportOptions;
