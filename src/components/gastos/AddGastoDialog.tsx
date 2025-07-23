"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SimpleDatePicker } from "@/components/ui/simple-date-picker";
import { useToast } from "@/components/ui/use-toast";
import { useConsultorio } from "@/contexts/ConsultorioContext";
import { 
  getCategorias, 
  getSubcategorias, 
  createGasto,
  updateGasto,
  uploadComprobante,
  CategoriaGasto,
  SubcategoriaGasto 
} from "@/lib/gastosService";
import { Loader2, Upload, X } from "lucide-react";

interface AddGastoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddGastoDialog({ open, onOpenChange, onSuccess }: AddGastoDialogProps) {
  const { toast } = useToast();
  const { consultorio } = useConsultorio();
  
  const [isLoading, setIsLoading] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaGasto[]>([]);
  const [subcategorias, setSubcategorias] = useState<SubcategoriaGasto[]>([]);
  const [file, setFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    categoria_id: "",
    subcategoria_id: "",
    monto: "",
    fecha: new Date(),
    descripcion: "",
    metodo_pago: "efectivo" as const,
    estado: "pagado" as const,
    notas: ""
  });

  const loadCategorias = useCallback(async () => {
    if (!consultorio) {
      console.log("[AddGastoDialog] No hay consultorio disponible");
      return;
    }
    
    console.log("[AddGastoDialog] Cargando categorías para consultorio:", consultorio.id);
    
    try {
      const data = await getCategorias(consultorio.id);
      console.log("[AddGastoDialog] Categorías cargadas:", data);
      setCategorias(data);
    } catch (error) {
      console.error("[AddGastoDialog] Error loading categorías:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive"
      });
    }
  }, [consultorio, toast]);

  const loadSubcategorias = useCallback(async (categoriaId: string) => {
    if (!consultorio) return;
    
    try {
      const data = await getSubcategorias(consultorio.id, categoriaId);
      setSubcategorias(data);
    } catch (error) {
      console.error("Error loading subcategorías:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las subcategorías",
        variant: "destructive"
      });
    }
  }, [consultorio, toast]);

  // Cargar categorías
  useEffect(() => {
    console.log("[AddGastoDialog] useEffect - open:", open, "consultorio:", consultorio);
    if (open && consultorio) {
      loadCategorias();
    }
  }, [open, consultorio, loadCategorias]);

  // Cargar subcategorías cuando cambia la categoría
  useEffect(() => {
    if (formData.categoria_id) {
      loadSubcategorias(formData.categoria_id);
    } else {
      setSubcategorias([]);
      setFormData(prev => ({ ...prev, subcategoria_id: "" }));
    }
  }, [formData.categoria_id, loadSubcategorias]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar tamaño (máximo 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "El archivo no debe superar los 5MB",
          variant: "destructive"
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultorio) return;

    // Validaciones
    if (!formData.subcategoria_id || !formData.monto || !formData.descripcion) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Crear el gasto
      const nuevoGasto = await createGasto({
        consultorio_id: consultorio.id,
        subcategoria_id: formData.subcategoria_id,
        monto: parseFloat(formData.monto),
        fecha: formData.fecha.toISOString().split('T')[0],
        descripcion: formData.descripcion,
        metodo_pago: formData.metodo_pago,
        estado: formData.estado,
        notas: formData.notas || undefined
      });

      // Subir comprobante si existe
      if (file && nuevoGasto.id) {
        try {
          const comprobanteUrl = await uploadComprobante(file, nuevoGasto.id);
          // Actualizar el gasto con la URL del comprobante
          await updateGasto(nuevoGasto.id, { comprobante_url: comprobanteUrl });
        } catch (error) {
          console.error("Error uploading comprobante:", error);
          // No fallar si no se puede subir el comprobante
        }
      }

      toast({
        title: "Éxito",
        description: "Gasto registrado correctamente"
      });

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error creating gasto:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar el gasto",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      categoria_id: "",
      subcategoria_id: "",
      monto: "",
      fecha: new Date(),
      descripcion: "",
      metodo_pago: "efectivo",
      estado: "pagado",
      notas: ""
    });
    setFile(null);
  };

  const categoriaSeleccionada = categorias.find(c => c.id === formData.categoria_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Gasto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="categoria">
                Categoría * 
                <span className="text-xs text-muted-foreground ml-2">
                  ({categorias.length} disponibles)
                </span>
              </Label>
              <Select
                value={formData.categoria_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoria_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  {categorias.length === 0 ? (
                    <SelectItem value="no-categorias" disabled>
                      No hay categorías disponibles
                    </SelectItem>
                  ) : (
                    categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: categoria.color || '#6B7280' }}
                          />
                          <span>{categoria.nombre}</span>
                          <span className="text-xs text-muted-foreground">
                            ({categoria.tipo})
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Subcategoría */}
            <div className="space-y-2">
              <Label htmlFor="subcategoria">Subcategoría *</Label>
              <Select
                value={formData.subcategoria_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, subcategoria_id: value }))}
                disabled={!formData.categoria_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona subcategoría" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  {subcategorias.map((subcategoria) => (
                    <SelectItem key={subcategoria.id} value={subcategoria.id}>
                      {subcategoria.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Monto */}
            <div className="space-y-2">
              <Label htmlFor="monto">Monto *</Label>
              <Input
                id="monto"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.monto}
                onChange={(e) => setFormData(prev => ({ ...prev, monto: e.target.value }))}
                required
              />
            </div>

            {/* Fecha */}
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha *</Label>
              <SimpleDatePicker
                date={formData.fecha}
                onSelect={(date) => date && setFormData(prev => ({ ...prev, fecha: date }))}
                placeholder="Selecciona la fecha del gasto"
              />
            </div>

            {/* Método de pago */}
            <div className="space-y-2">
              <Label htmlFor="metodo_pago">Método de pago</Label>
              <Select
                value={formData.metodo_pago}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, metodo_pago: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="tarjeta_debito">Tarjeta de débito</SelectItem>
                  <SelectItem value="tarjeta_credito">Tarjeta de crédito</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, estado: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="pagado">Pagado</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción *</Label>
            <Input
              id="descripcion"
              placeholder="Describe el gasto"
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              required
            />
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas adicionales</Label>
            <Textarea
              id="notas"
              placeholder="Información adicional, proveedor, etc."
              value={formData.notas}
              onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Comprobante */}
          <div className="space-y-2">
            <Label htmlFor="comprobante">Comprobante (opcional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="comprobante"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('comprobante')?.click()}
                className="w-full justify-start"
              >
                <Upload className="h-4 w-4 mr-2" />
                {file ? file.name : "Seleccionar archivo"}
              </Button>
              {file && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                Archivo seleccionado: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Registrar Gasto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 