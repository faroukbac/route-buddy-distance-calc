
import { Location } from "@/types/location";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface LocationConfirmDialogProps {
  location: Location | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const LocationConfirmDialog = ({
  location,
  open,
  onOpenChange,
  onConfirm,
  onCancel
}: LocationConfirmDialogProps) => {
  if (!location) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmer l'emplacement</DialogTitle>
          <DialogDescription>
            Vérifiez les détails avant d'ajouter cet emplacement
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 gap-4 items-center">
            <span className="font-medium">Nom:</span>
            <span className="col-span-2">{location.name}</span>
          </div>
          <div className="grid grid-cols-3 gap-4 items-center">
            <span className="font-medium">Latitude:</span>
            <span className="col-span-2">{location.lat.toFixed(6)}</span>
          </div>
          <div className="grid grid-cols-3 gap-4 items-center">
            <span className="font-medium">Longitude:</span>
            <span className="col-span-2">{location.lng.toFixed(6)}</span>
          </div>
          {location.address && (
            <div className="grid grid-cols-3 gap-4 items-center">
              <span className="font-medium">Adresse:</span>
              <span className="col-span-2">{location.address}</span>
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            Annuler
          </Button>
          <Button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700">
            <Check className="mr-2 h-4 w-4" />
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LocationConfirmDialog;
