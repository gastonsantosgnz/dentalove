"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useConsultorio } from "@/contexts/ConsultorioContext";
import { getPacientes } from "@/lib/pacientesService";
import { getDoctores } from "@/lib/doctoresService";
import { 
  getCategorias, 
  createIngreso, 
  createPago,
  CategoriaIngreso 
} from "@/lib/ingresosService";
import { Paciente } from "@/lib/database";
import { Doctor } from "@/lib/doctoresService";

interface AddIngresoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  pacienteId?: string;
  servicioProgresoId?: string;
  appointmentId?: string;
}

export default function AddIngresoDialog({
  open,
  onOpenChange,
  onSuccess,
  pacienteId,
  servicioProgresoId,
  appointmentId
}: AddIngresoDialogProps) {
  const { toast } = useToast();
  const { consultorio } = useConsultorio();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [categorias, setCategorias] = useState<CategoriaIngreso[]>([]);
  const [registrarPago, setRegistrarPago] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    paciente_id: pacienteId || "",
    doctor_id: "",
    categoria_id: "",
    concepto: "",
    descripcion: "",
    monto_total: "",
    porcentaje_comision: "",
    fecha_servicio: new Date(),
    notas: "",
    // Datos del pago
    monto_pago: "",
    metodo_pago: "efectivo",
    referencia: "",
    fecha_pago: new Date(),
  });

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      if (!consultorio || !open) return;

      try {
        const [pacientesData, doctoresData, categoriasData] = await Promise.all([
          getPacientes(),
          getDoctores(),
          getCategorias(consultorio.id)
        ]);

        setPacientes(pacientesData);
        setDoctores(doctoresData);
        setCategorias(categoriasData);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos",
          variant: "destructive"
        });
      }
    };

    loadData();
  }, [consultorio, open, toast]);

  // Auto-llenar porcentaje de comisión cuando se selecciona un doctor
  useEffect(() => {
    if (formData.doctor_id) {
      const doctor = doctores.find(d => d.id === formData.doctor_id);
      if (doctor && 'porcentaje_comision' in doctor) {
        setFormData(prev => ({
          ...prev,
          porcentaje_comision: String(doctor.porcentaje_comision || 0)
        }));
      }
    }
  }, [formData.doctor_id, doctores]);

  // Auto-llenar monto del pago con el total
  useEffect(() => {
    if (registrarPago && formData.monto_total) {
      setFormData(prev => ({
        ...prev,
        monto_pago: formData.monto_total
      }));
    }
  }, [registrarPago, formData.monto_total]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!consultorio) return;

    setIsSubmitting(true);

    try {
      // Crear el ingreso
      const ingresoData = {
        consultorio_id: consultorio.id,
        paciente_id: formData.paciente_id || undefined,
        doctor_id: formData.doctor_id || undefined,
        categoria_id: formData.categoria_id || undefined,
        servicio_progreso_id: servicioProgresoId,
        appointment_id: appointmentId,
        concepto: formData.concepto,
        descripcion: formData.descripcion || undefined,
        monto_total: parseFloat(formData.monto_total),
        porcentaje_comision: formData.porcentaje_comision ? parseFloat(formData.porcentaje_comision) : undefined,
        fecha_servicio: format(formData.fecha_servicio, 'yyyy-MM-dd'),
        notas: formData.notas || undefined
      };

      const ingreso = await createIngreso(ingresoData);

      // Si se marcó registrar pago, crear el pago
      if (registrarPago && formData.monto_pago) {
        const pagoData = {
          ingreso_id: ingreso.id,
          monto: parseFloat(formData.monto_pago),
          metodo_pago: formData.metodo_pago as any,
          referencia: formData.referencia || undefined,
          fecha_pago: format(formData.fecha_pago, 'yyyy-MM-dd'),
          notas: undefined
        };

        await createPago(pagoData);
      }

      toast({
        title: "Ingreso registrado",
        description: "El ingreso se ha registrado correctamente",
      });

      onSuccess();
      resetForm();
    } catch (error) {
      console.error("Error creating ingreso:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar el ingreso",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      paciente_id: pacienteId || "",
      doctor_id: "",
      categoria_id: "",
      concepto: "",
      descripcion: "",
      monto_total: "",
      porcentaje_comision: "",
      fecha_servicio: new Date(),
      notas: "",
      monto_pago: "",
      metodo_pago: "efectivo",
      referencia: "",
      fecha_pago: new Date(),
    });
    setRegistrarPago(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Registrar Ingreso</DialogTitle>
            <DialogDescription>
              Registra un nuevo ingreso en el sistema
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Categoría */}
            <div className="grid gap-2">
              <Label htmlFor="categoria">Categoría *</Label>
              <Select
                value={formData.categoria_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoria_id: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Concepto */}
            <div className="grid gap-2">
              <Label htmlFor="concepto">Concepto *</Label>
              <Input
                id="concepto"
                value={formData.concepto}
                onChange={(e) => setFormData(prev => ({ ...prev, concepto: e.target.value }))}
                placeholder="Ej: Limpieza dental, Consulta general"
                required
              />
            </div>

            {/* Descripción */}
            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Detalles adicionales del servicio"
                rows={2}
              />
            </div>

            {/* Paciente */}
            <div className="grid gap-2">
              <Label htmlFor="paciente">Paciente</Label>
              <Select
                value={formData.paciente_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, paciente_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un paciente (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin paciente</SelectItem>
                  {pacientes.map((paciente) => (
                    <SelectItem key={paciente.id} value={paciente.id}>
                      {paciente.nombre_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Doctor */}
            <div className="grid gap-2">
              <Label htmlFor="doctor">Doctor</Label>
              <Select
                value={formData.doctor_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, doctor_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un doctor (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin doctor</SelectItem>
                  {doctores.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.nombre_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Monto */}
              <div className="grid gap-2">
                <Label htmlFor="monto">Monto Total *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                  <Input
                    id="monto"
                    type="number"
                    step="0.01"
                    value={formData.monto_total}
                    onChange={(e) => setFormData(prev => ({ ...prev, monto_total: e.target.value }))}
                    className="pl-8"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Comisión */}
              <div className="grid gap-2">
                <Label htmlFor="comision">Comisión Doctor (%)</Label>
                <div className="relative">
                  <Input
                    id="comision"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.porcentaje_comision}
                    onChange={(e) => setFormData(prev => ({ ...prev, porcentaje_comision: e.target.value }))}
                    className="pr-8"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                </div>
              </div>
            </div>

            {/* Fecha */}
            <div className="grid gap-2">
              <Label>Fecha del Servicio *</Label>
              <DatePicker
                value={formData.fecha_servicio}
                onChange={(date) => date && setFormData(prev => ({ ...prev, fecha_servicio: date }))}
                placeholder="Selecciona la fecha"
              />
            </div>

            {/* Notas */}
            <div className="grid gap-2">
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                value={formData.notas}
                onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                placeholder="Notas adicionales"
                rows={2}
              />
            </div>

            {/* Sección de Pago */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="registrar-pago"
                  checked={registrarPago}
                  onCheckedChange={(checked) => setRegistrarPago(checked as boolean)}
                />
                <Label
                  htmlFor="registrar-pago"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Registrar pago inmediato
                </Label>
              </div>

              {registrarPago && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Monto del pago */}
                    <div className="grid gap-2">
                      <Label htmlFor="monto-pago">Monto del Pago</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                        <Input
                          id="monto-pago"
                          type="number"
                          step="0.01"
                          value={formData.monto_pago}
                          onChange={(e) => setFormData(prev => ({ ...prev, monto_pago: e.target.value }))}
                          className="pl-8"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Método de pago */}
                    <div className="grid gap-2">
                      <Label htmlFor="metodo">Método de Pago</Label>
                      <Select
                        value={formData.metodo_pago}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, metodo_pago: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="efectivo">Efectivo</SelectItem>
                          <SelectItem value="tarjeta_credito">Tarjeta de Crédito</SelectItem>
                          <SelectItem value="tarjeta_debito">Tarjeta de Débito</SelectItem>
                          <SelectItem value="transferencia">Transferencia</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Referencia */}
                  {formData.metodo_pago !== 'efectivo' && (
                    <div className="grid gap-2">
                      <Label htmlFor="referencia">Referencia</Label>
                      <Input
                        id="referencia"
                        value={formData.referencia}
                        onChange={(e) => setFormData(prev => ({ ...prev, referencia: e.target.value }))}
                        placeholder="Número de transacción, cheque, etc."
                      />
                    </div>
                  )}

                  {/* Fecha del pago */}
                  <div className="grid gap-2">
                    <Label>Fecha del Pago</Label>
                    <DatePicker
                      value={formData.fecha_pago}
                      onChange={(date) => date && setFormData(prev => ({ ...prev, fecha_pago: date }))}
                      placeholder="Selecciona la fecha"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 