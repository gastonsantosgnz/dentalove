import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { formatCurrency } from "../utils";

interface ServicioActual {
  zona: string;
  nombreServicio: string;
  zonaId: string;
  servicioId: string | null | undefined;
  esGeneral: boolean;
  costo: number;
}

interface PagoServicioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servicioActual: ServicioActual | null;
  fecha: Date;
  setFecha: (date: Date) => void;
  monto: string;
  setMonto: (monto: string) => void;
  onConfirm: () => void;
  loading: boolean;
}

export function PagoServicioDialog({
  open,
  onOpenChange,
  servicioActual,
  fecha,
  setFecha,
  monto,
  setMonto,
  onConfirm,
  loading
}: PagoServicioDialogProps) {
  if (!servicioActual) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
          <DialogDescription>
            Actualice el monto y la fecha del pago.
          </DialogDescription>
        </DialogHeader>
        
        <div>
          <div className="py-4">
            <div className="font-medium mb-1">{servicioActual.nombreServicio}</div>
            <div className="text-sm text-slate-600 mb-4">
              Costo del servicio: ${formatCurrency(servicioActual.costo)}
            </div>
            
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="fechaPago">Fecha de pago</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !fecha && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fecha ? format(fecha, "PPP", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={fecha}
                      onSelect={(date) => date && setFecha(date)}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="montoPago">Monto pagado</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <Input
                    id="montoPago"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="pl-7"
                    type="number"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={onConfirm}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Actualizando...' : 'Actualizar Pago'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
} 