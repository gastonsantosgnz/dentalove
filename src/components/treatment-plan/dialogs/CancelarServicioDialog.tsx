import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

interface ServicioActual {
  zona: string;
  nombreServicio: string;
  zonaId: string;
  servicioId: string | null | undefined;
  esGeneral: boolean;
  costo: number;
}

interface CancelarServicioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servicioActual: ServicioActual | null;
  notas: string;
  setNotas: (notas: string) => void;
  onConfirm: () => void;
  loading: boolean;
}

export function CancelarServicioDialog({
  open,
  onOpenChange,
  servicioActual,
  notas,
  setNotas,
  onConfirm,
  loading
}: CancelarServicioDialogProps) {
  if (!servicioActual) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar Servicio</DialogTitle>
          <DialogDescription>
            ¿Está seguro que desea cancelar este servicio?
          </DialogDescription>
        </DialogHeader>
        
        <div>
          <div className="py-4">
            <div className="font-medium mb-1">{servicioActual.nombreServicio}</div>
            <div className="text-sm text-slate-600 mb-4">
              Esta acción puede ser revertida después.
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notasCancelacion">Motivo de cancelación</Label>
              <Textarea
                id="notasCancelacion"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Indique el motivo de la cancelación"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Volver atrás
            </Button>
            <Button 
              onClick={onConfirm}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Procesando...' : 'Sí, cancelar servicio'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
} 