import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, UserIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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

interface CompletarServicioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servicioActual: ServicioActual | null;
  fecha: Date;
  setFecha: (date: Date) => void;
  monto: string;
  setMonto: (monto: string) => void;
  notas: string;
  setNotas: (notas: string) => void;
  doctorSeleccionado: string;
  setDoctorSeleccionado: (doctorId: string) => void;
  crearIngresoAutomatico: boolean;
  setCrearIngresoAutomatico: (value: boolean) => void;
  doctores: any[];
  onConfirm: () => void;
  loading: boolean;
}

export function CompletarServicioDialog({
  open,
  onOpenChange,
  servicioActual,
  fecha,
  setFecha,
  monto,
  setMonto,
  notas,
  setNotas,
  doctorSeleccionado,
  setDoctorSeleccionado,
  crearIngresoAutomatico,
  setCrearIngresoAutomatico,
  doctores,
  onConfirm,
  loading
}: CompletarServicioDialogProps) {
  if (!servicioActual) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Completar Servicio</DialogTitle>
          <DialogDescription>
            Registre los detalles del servicio completado.
          </DialogDescription>
        </DialogHeader>
        
        <div>
          <div className="py-4">
            <div className="font-medium mb-1">{servicioActual.nombreServicio}</div>
            <div className="text-sm text-slate-600 mb-4">
              Costo: ${formatCurrency(servicioActual.costo)}
            </div>
            
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="fecha">Fecha de realización</Label>
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
                <Label htmlFor="monto">Monto pagado</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <Input
                    id="monto"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="pl-7"
                    type="number"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notas">Notas adicionales</Label>
                <Textarea
                  id="notas"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Detalles o comentarios sobre el servicio"
                  rows={3}
                />
              </div>

              {/* Configuración de Ingreso Automático */}
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Crear ingreso automáticamente</Label>
                    <p className="text-sm text-muted-foreground">
                      Al completar el servicio, se registrará automáticamente como ingreso
                    </p>
                  </div>
                  <Switch
                    checked={crearIngresoAutomatico}
                    onCheckedChange={setCrearIngresoAutomatico}
                  />
                </div>

                {crearIngresoAutomatico && (
                  <div className="grid gap-2">
                    <Label htmlFor="doctor">Doctor responsable</Label>
                    <Select value={doctorSeleccionado} onValueChange={setDoctorSeleccionado}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar doctor" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="z-[9999]">
                        {doctores.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4" />
                              <span>{doctor.nombre_completo}</span>
                              {doctor.porcentaje_comision && doctor.porcentaje_comision > 0 && (
                                <span className="text-sm text-muted-foreground">
                                  ({doctor.porcentaje_comision}% comisión)
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Guardando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
} 