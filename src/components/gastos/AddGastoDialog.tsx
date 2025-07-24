"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import { getDoctoresByConsultorio, Doctor } from "@/lib/doctoresService";
import { getEmpleadosByConsultorio, Empleado } from "@/lib/empleadosService";
import { getProveedoresByConsultorio, Proveedor } from "@/lib/proveedoresService";
import { getLaboratoriosByConsultorio, Laboratorio } from "@/lib/laboratoriosService";
import { Loader2, Upload, X, Receipt, User, FileCheck, Users, Building, Factory } from "lucide-react";

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
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
  const [file, setFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    categoria_id: "",
    subcategoria_id: "",
    monto: "",
    fecha: new Date(),
    descripcion: "",
    metodo_pago: "efectivo" as const,
    estado: "pagado" as const,
    notas: "",
    // NUEVOS CAMPOS
    genera_factura: false,
    numero_factura: "",
    proveedor_beneficiario: "",
    es_deducible: true,
    // CAMPOS DE RELACIÓN
    doctor_id: "",
    empleado_id: "",
    proveedor_id: "",
    laboratorio_id: ""
  });

  // Función para cargar doctores del consultorio
  const loadDoctores = useCallback(async () => {
    if (!consultorio) {
      console.log("[AddGastoDialog] No hay consultorio disponible para cargar doctores");
      return;
    }
    
    console.log("[AddGastoDialog] Cargando doctores para consultorio:", consultorio.id);
    
    try {
      const data = await getDoctoresByConsultorio(consultorio.id);
      console.log("[AddGastoDialog] Doctores cargados:", data);
      setDoctores(data);
    } catch (error) {
      console.error("[AddGastoDialog] Error loading doctores:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los doctores",
        variant: "destructive"
      });
    }
  }, [consultorio, toast]);

  // Función para cargar empleados del consultorio
  const loadEmpleados = useCallback(async () => {
    if (!consultorio) {
      console.log("[AddGastoDialog] No hay consultorio disponible para cargar empleados");
      return;
    }
    
    console.log("[AddGastoDialog] Cargando empleados para consultorio:", consultorio.id);
    
    try {
      const data = await getEmpleadosByConsultorio(consultorio.id);
      console.log("[AddGastoDialog] Empleados cargados:", data);
      setEmpleados(data);
    } catch (error) {
      console.error("[AddGastoDialog] Error loading empleados:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los empleados",
        variant: "destructive"
      });
    }
  }, [consultorio, toast]);

  // Función para cargar proveedores del consultorio
  const loadProveedores = useCallback(async () => {
    if (!consultorio) {
      console.log("[AddGastoDialog] No hay consultorio disponible para cargar proveedores");
      return;
    }
    
    console.log("[AddGastoDialog] Cargando proveedores para consultorio:", consultorio.id);
    
    try {
      const data = await getProveedoresByConsultorio(consultorio.id);
      console.log("[AddGastoDialog] Proveedores cargados:", data);
      setProveedores(data);
    } catch (error) {
      console.error("[AddGastoDialog] Error loading proveedores:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los proveedores",
        variant: "destructive"
      });
    }
  }, [consultorio, toast]);

  // Función para cargar laboratorios del consultorio
  const loadLaboratorios = useCallback(async () => {
    if (!consultorio) {
      console.log("[AddGastoDialog] No hay consultorio disponible para cargar laboratorios");
      return;
    }
    
    console.log("[AddGastoDialog] Cargando laboratorios para consultorio:", consultorio.id);
    
    try {
      const data = await getLaboratoriosByConsultorio(consultorio.id);
      console.log("[AddGastoDialog] Laboratorios cargados:", data);
      setLaboratorios(data);
    } catch (error) {
      console.error("[AddGastoDialog] Error loading laboratorios:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los laboratorios",
        variant: "destructive"
      });
    }
  }, [consultorio, toast]);

  // Cargar categorías
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

  // Cargar subcategorías cuando cambia la categoría
  useEffect(() => {
    if (formData.categoria_id) {
      loadSubcategorias(formData.categoria_id);
    } else {
      setSubcategorias([]);
      setFormData(prev => ({ ...prev, subcategoria_id: "" }));
    }
  }, [formData.categoria_id, loadSubcategorias]);

  // Cargar categorías, doctores, empleados, proveedores y laboratorios cuando se abre el diálogo
  useEffect(() => {
    console.log("[AddGastoDialog] useEffect - open:", open, "consultorio:", consultorio);
    if (open && consultorio) {
      loadCategorias();
      loadDoctores();
      loadEmpleados();
      loadProveedores();
      loadLaboratorios();
    }
  }, [open, consultorio, loadCategorias, loadDoctores, loadEmpleados, loadProveedores, loadLaboratorios]);

  // Verificar si la subcategoría seleccionada es "Comisiones Doctores"
  const esComisionDoctores = useMemo(() => {
    const subcategoriaSeleccionada = subcategorias.find(s => s.id === formData.subcategoria_id);
    return subcategoriaSeleccionada?.nombre?.toLowerCase().includes('comision') && 
           subcategoriaSeleccionada?.nombre?.toLowerCase().includes('doctor');
  }, [formData.subcategoria_id, subcategorias]);

  // Verificar si la subcategoría seleccionada es "Sueldos"
  const esSueldoEmpleado = useMemo(() => {
    const subcategoriaSeleccionada = subcategorias.find(s => s.id === formData.subcategoria_id);
    return subcategoriaSeleccionada?.nombre?.toLowerCase().includes('sueldo') || 
           subcategoriaSeleccionada?.nombre?.toLowerCase().includes('salario');
  }, [formData.subcategoria_id, subcategorias]);

  // Verificar si la categoría seleccionada es "Materiales" (para laboratorios)
  const esMaterialesCategoria = useMemo(() => {
    const categoriaSeleccionada = categorias.find(c => c.id === formData.categoria_id);
    return categoriaSeleccionada?.nombre?.toLowerCase().includes('materiales');
  }, [formData.categoria_id, categorias]);

  // Verificar si la categoría seleccionada es "Equipamiento" (para proveedores)
  const esEquipamientoCategoria = useMemo(() => {
    const categoriaSeleccionada = categorias.find(c => c.id === formData.categoria_id);
    return categoriaSeleccionada?.nombre?.toLowerCase().includes('equipamiento');
  }, [formData.categoria_id, categorias]);

  // Limpiar proveedor, doctor, empleado, proveedor y laboratorio cuando cambia la subcategoría  
  useEffect(() => {
    setFormData(prev => ({ 
      ...prev, 
      proveedor_beneficiario: "",
      doctor_id: "",
      empleado_id: "",
      proveedor_id: "",
      laboratorio_id: ""
    }));
  }, [formData.subcategoria_id]);

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

    // Validación específica para comisiones de doctores
    if (esComisionDoctores && !formData.doctor_id) {
      toast({
        title: "Error",
        description: "Debes seleccionar un doctor para registrar la comisión",
        variant: "destructive"
      });
      return;
    }

    // Validación específica para sueldos de empleados
    if (esSueldoEmpleado && !formData.empleado_id) {
      toast({
        title: "Error",
        description: "Debes seleccionar un empleado para registrar el sueldo",
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
        notas: formData.notas || undefined,
        // NUEVOS CAMPOS
        genera_factura: formData.genera_factura,
        numero_factura: formData.numero_factura,
        proveedor_beneficiario: formData.proveedor_beneficiario,
        es_deducible: formData.es_deducible,
        // CAMPOS DE RELACIÓN
        doctor_id: formData.doctor_id,
        empleado_id: formData.empleado_id,
        proveedor_id: formData.proveedor_id,
        laboratorio_id: formData.laboratorio_id
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
      notas: "",
      // NUEVOS CAMPOS
      genera_factura: false,
      numero_factura: "",
      proveedor_beneficiario: "",
      es_deducible: true,
      // CAMPOS DE RELACIÓN
      doctor_id: "",
      empleado_id: "",
      proveedor_id: "",
      laboratorio_id: ""
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

          {/* NUEVOS CAMPOS DE INFORMACIÓN FISCAL */}
          <div className="grid grid-cols-2 gap-4">
            {/* Proveedor/Beneficiario - Condicional */}
            <div className="space-y-2">
              <Label htmlFor="proveedor_beneficiario">
                {esComisionDoctores ? (
                  <>
                    <User className="h-4 w-4 inline mr-1" />
                    Doctor *
                  </>
                ) : esSueldoEmpleado ? (
                  <>
                    <Users className="h-4 w-4 inline mr-1" />
                    Empleado *
                  </>
                ) : esEquipamientoCategoria ? (
                  <>
                    <Building className="h-4 w-4 inline mr-1" />
                    Proveedor (Opcional)
                  </>
                ) : esMaterialesCategoria ? (
                  <>
                    <Factory className="h-4 w-4 inline mr-1" />
                    Laboratorio (Opcional)
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 inline mr-1" />
                    Proveedor/Beneficiario
                  </>
                )}
              </Label>
              
              {esComisionDoctores ? (
                // Dropdown de doctores
                <Select
                  value={formData.doctor_id}
                  onValueChange={(doctorId) => {
                    const doctorSeleccionado = doctores.find(d => d.id === doctorId);
                    setFormData(prev => ({ 
                      ...prev, 
                      doctor_id: doctorId,
                      proveedor_beneficiario: doctorSeleccionado?.nombre_completo || ""
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el doctor" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {doctores.length === 0 ? (
                      <SelectItem value="no-doctores" disabled>
                        No hay doctores disponibles
                      </SelectItem>
                    ) : (
                      doctores.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{doctor.nombre_completo}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {doctor.especialidad}
                            </span>
                            {doctor.porcentaje_comision && doctor.porcentaje_comision > 0 && (
                              <span className="text-xs bg-green-100 text-green-600 px-1 rounded ml-2">
                                {doctor.porcentaje_comision}%
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              ) : esSueldoEmpleado ? (
                // Dropdown de empleados
                <Select
                  value={formData.empleado_id}
                  onValueChange={(empleadoId) => {
                    const empleadoSeleccionado = empleados.find(e => e.id === empleadoId);
                    setFormData(prev => ({ 
                      ...prev, 
                      empleado_id: empleadoId,
                      proveedor_beneficiario: empleadoSeleccionado?.nombre_completo || ""
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el empleado" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {empleados.length === 0 ? (
                      <SelectItem value="no-empleados" disabled>
                        No hay empleados disponibles
                      </SelectItem>
                    ) : (
                      empleados.map((empleado) => (
                        <SelectItem key={empleado.id} value={empleado.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{empleado.nombre_completo}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {empleado.puesto}
                            </span>
                            {empleado.departamento && (
                              <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded ml-2">
                                {empleado.departamento}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              ) : esEquipamientoCategoria ? (
                // Sección flexible para Equipamiento - Dropdown de proveedores O texto libre
                <div className="space-y-2">
                  <Select
                    value={formData.proveedor_id}
                    onValueChange={(proveedorId) => {
                      if (proveedorId === 'manual') {
                        // Cambiar a modo manual
                        setFormData(prev => ({ 
                          ...prev, 
                          proveedor_id: '',
                          proveedor_beneficiario: ''
                        }));
                      } else {
                        const proveedorSeleccionado = proveedores.find(p => p.id === proveedorId);
                        setFormData(prev => ({ 
                          ...prev, 
                          proveedor_id: proveedorId,
                          proveedor_beneficiario: proveedorSeleccionado?.nombre_comercial || ""
                        }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un proveedor registrado" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="manual">
                        <span className="text-blue-600">✏️ Introducir manualmente</span>
                      </SelectItem>
                      {proveedores.length === 0 ? (
                        <SelectItem value="no-proveedores" disabled>
                          No hay proveedores disponibles
                        </SelectItem>
                      ) : (
                        proveedores.map((proveedor) => (
                          <SelectItem key={proveedor.id} value={proveedor.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{proveedor.nombre_comercial}</span>
                              {proveedor.categoria_proveedor && (
                                <span className="text-xs bg-orange-100 text-orange-600 px-1 rounded ml-2">
                                  {proveedor.categoria_proveedor}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {!formData.proveedor_id && (
                    <Input
                      placeholder="O introduce el nombre del proveedor manualmente"
                      value={formData.proveedor_beneficiario}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        proveedor_beneficiario: e.target.value,
                        proveedor_id: ''
                      }))}
                    />
                  )}
                </div>
              ) : esMaterialesCategoria ? (
                // Sección flexible para Materiales - Dropdown de laboratorios O texto libre
                <div className="space-y-2">
                  <Select
                    value={formData.laboratorio_id}
                    onValueChange={(laboratorioId) => {
                      if (laboratorioId === 'manual') {
                        // Cambiar a modo manual
                        setFormData(prev => ({ 
                          ...prev, 
                          laboratorio_id: '',
                          proveedor_beneficiario: ''
                        }));
                      } else {
                        const laboratorioSeleccionado = laboratorios.find(l => l.id === laboratorioId);
                        setFormData(prev => ({ 
                          ...prev, 
                          laboratorio_id: laboratorioId,
                          proveedor_beneficiario: laboratorioSeleccionado?.nombre_laboratorio || ""
                        }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un laboratorio registrado" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="manual">
                        <span className="text-blue-600">✏️ Introducir manualmente</span>
                      </SelectItem>
                      {laboratorios.length === 0 ? (
                        <SelectItem value="no-laboratorios" disabled>
                          No hay laboratorios disponibles
                        </SelectItem>
                      ) : (
                        laboratorios.map((laboratorio) => (
                          <SelectItem key={laboratorio.id} value={laboratorio.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{laboratorio.nombre_laboratorio}</span>
                              {laboratorio.especialidades && laboratorio.especialidades.length > 0 && (
                                <span className="text-xs bg-purple-100 text-purple-600 px-1 rounded ml-2">
                                  {laboratorio.especialidades[0]}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {!formData.laboratorio_id && (
                    <Input
                      placeholder="O introduce el nombre del proveedor/laboratorio manualmente"
                      value={formData.proveedor_beneficiario}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        proveedor_beneficiario: e.target.value,
                        laboratorio_id: ''
                      }))}
                    />
                  )}
                </div>
              ) : (
                // Input normal para otros casos
                <Input
                  id="proveedor_beneficiario"
                  placeholder="Nombre del proveedor o a quién se le pagó"
                  value={formData.proveedor_beneficiario}
                  onChange={(e) => setFormData(prev => ({ ...prev, proveedor_beneficiario: e.target.value }))}
                />
              )}
            </div>

            {/* Genera Factura */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Genera Factura Fiscal
              </Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="genera_factura"
                  checked={formData.genera_factura}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    genera_factura: e.target.checked,
                    numero_factura: e.target.checked ? prev.numero_factura : ""
                  }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="genera_factura" className="text-sm">
                  Este gasto genera factura fiscal
                </Label>
              </div>
            </div>
          </div>

          {/* Número de Factura (solo si genera factura) */}
          {formData.genera_factura && (
            <div className="space-y-2">
              <Label htmlFor="numero_factura">
                <FileCheck className="h-4 w-4 inline mr-1" />
                Número de Factura
              </Label>
              <Input
                id="numero_factura"
                placeholder="Número de factura o folio fiscal"
                value={formData.numero_factura}
                onChange={(e) => setFormData(prev => ({ ...prev, numero_factura: e.target.value }))}
              />
            </div>
          )}

          {/* Es Deducible */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Deducibilidad Fiscal
            </Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="es_deducible"
                checked={formData.es_deducible}
                onChange={(e) => setFormData(prev => ({ ...prev, es_deducible: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="es_deducible" className="text-sm">
                Este gasto es deducible fiscalmente
              </Label>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas adicionales</Label>
            <Textarea
              id="notas"
              placeholder="Información adicional, observaciones, etc."
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