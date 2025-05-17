'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  CalendarIcon, 
  Check, 
  CheckCircle2, 
  DollarSign, 
  XCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/lib/supabase';

import {
  ServicioProgreso,
  getServiciosProgresoPaciente,
  getServiciosProgresoVersion,
  marcarServicioCompletado,
  marcarServicioCancelado,
  registrarPagoServicio,
  getResumenProgresoPlan
} from '@/lib/serviciosProgresoService';

import {
  getPlanesTratamientoPaciente
} from '@/lib/planesTratamientoService';

interface PlanTratamiento {
  id: string;
  paciente_id: string;
  fecha: string;
  observaciones?: string | null;
  costo_total: number;
  versiones?: PlanVersion[];
  created_at?: string;
  updated_at?: string;
}

interface PlanVersion {
  id: string;
  plan_id: string;
  nombre: string;
  activa: boolean;
  costo_total: number;
}

interface SeguimientoTratamientoProps {
  pacienteId: string;
}

export default function SeguimientoTratamiento({ pacienteId }: SeguimientoTratamientoProps) {
  const [loading, setLoading] = useState(true);
  const [planes, setPlanes] = useState<PlanTratamiento[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [servicios, setServicios] = useState<ServicioProgreso[]>([]);
  const [servicioDetalles, setServicioDetalles] = useState<any[]>([]);
  const [resumen, setResumen] = useState<{
    total: number;
    completados: number;
    pendientes: number;
    cancelados: number;
    totalMontoPagado: number;
  }>({
    total: 0,
    completados: 0,
    pendientes: 0,
    cancelados: 0,
    totalMontoPagado: 0
  });

  // Estado para diálogos
  const [servicioActual, setServicioActual] = useState<ServicioProgreso | null>(null);
  const [fecha, setFecha] = useState<Date>(new Date());
  const [monto, setMonto] = useState<string>('');
  const [notas, setNotas] = useState<string>('');
  
  // Cargar planes de tratamiento del paciente
  useEffect(() => {
    async function cargarPlanes() {
      if (!pacienteId) return;
      
      setLoading(true);
      try {
        const planesData = await getPlanesTratamientoPaciente(pacienteId);
        
        // Enriquecer cada plan con sus versiones
        const planesConVersiones = await Promise.all(
          planesData.map(async (plan) => {
            // Aquí normalmente haríamos una llamada para obtener las versiones
            // Como no tenemos esa función específica, estamos simulando
            // En un entorno real, reemplazarías esto con una llamada a una API real
            
            // Simulación - en producción, reemplazar por llamada real
            const { data: versiones } = await supabase
              .from('plan_versiones')
              .select('*')
              .eq('plan_id', plan.id);
            
            return {
              ...plan,
              versiones: versiones || []
            };
          })
        );
        
        setPlanes(planesConVersiones);
        
        // Si hay planes, seleccionar el primero automáticamente
        if (planesConVersiones.length > 0) {
          setSelectedPlan(planesConVersiones[0].id);
          
          // Si el plan tiene versiones, seleccionar la versión activa o la primera
          if (planesConVersiones[0].versiones && planesConVersiones[0].versiones.length > 0) {
            const versionActiva = planesConVersiones[0].versiones.find(v => v.activa);
            setSelectedVersion(versionActiva ? versionActiva.id : planesConVersiones[0].versiones[0].id);
          }
        }
      } catch (error) {
        console.error('Error al cargar los planes de tratamiento:', error);
      } finally {
        setLoading(false);
      }
    }
    
    cargarPlanes();
  }, [pacienteId]);
  
  // Cuando cambia la versión seleccionada, cargar los servicios correspondientes
  useEffect(() => {
    async function cargarServicios() {
      if (!selectedVersion) return;
      
      setLoading(true);
      try {
        const serviciosData = await getServiciosProgresoVersion(selectedVersion);
        setServicios(serviciosData);
        
        // Obtener detalles adicionales de servicios
        // En una app real, esto podría ser una vista de Supabase
        const { data: detallesData } = await supabase
          .from('zona_tratamientos')
          .select(`
            id,
            nombre_tratamiento,
            costo
          `)
          .in('id', serviciosData.map(s => s.zona_tratamiento_id));
        
        setServicioDetalles(detallesData || []);
        
        // Obtener resumen del plan seleccionado
        if (selectedPlan) {
          const resumenData = await getResumenProgresoPlan(selectedPlan);
          setResumen(resumenData);
        }
      } catch (error) {
        console.error('Error al cargar los servicios:', error);
      } finally {
        setLoading(false);
      }
    }
    
    cargarServicios();
  }, [selectedVersion, selectedPlan]);
  
  // Cambiar el plan seleccionado
  const handleChangePlan = (planId: string) => {
    setSelectedPlan(planId);
    
    // Buscar el plan seleccionado
    const plan = planes.find(p => p.id === planId);
    if (plan && plan.versiones && plan.versiones.length > 0) {
      // Seleccionar versión activa o primera disponible
      const versionActiva = plan.versiones.find(v => v.activa);
      setSelectedVersion(versionActiva ? versionActiva.id : plan.versiones[0].id);
    } else {
      setSelectedVersion('');
    }
  };
  
  // Marcar un servicio como completado
  const handleCompletarServicio = async () => {
    if (!servicioActual) return;
    
    try {
      setLoading(true);
      await marcarServicioCompletado(
        servicioActual.id, 
        fecha.toISOString(), 
        parseFloat(monto) || 0,
        notas
      );
      
      // Recargar servicios
      const serviciosActualizados = await getServiciosProgresoVersion(selectedVersion);
      setServicios(serviciosActualizados);
      
      // Actualizar resumen
      const resumenActualizado = await getResumenProgresoPlan(selectedPlan);
      setResumen(resumenActualizado);
      
      // Limpiar estado del diálogo
      setServicioActual(null);
      setFecha(new Date());
      setMonto('');
      setNotas('');
    } catch (error) {
      console.error('Error al completar el servicio:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Marcar un servicio como cancelado
  const handleCancelarServicio = async () => {
    if (!servicioActual) return;
    
    try {
      setLoading(true);
      await marcarServicioCancelado(servicioActual.id, notas);
      
      // Recargar servicios
      const serviciosActualizados = await getServiciosProgresoVersion(selectedVersion);
      setServicios(serviciosActualizados);
      
      // Actualizar resumen
      const resumenActualizado = await getResumenProgresoPlan(selectedPlan);
      setResumen(resumenActualizado);
      
      // Limpiar estado del diálogo
      setServicioActual(null);
      setNotas('');
    } catch (error) {
      console.error('Error al cancelar el servicio:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Registrar pago
  const handleRegistrarPago = async () => {
    if (!servicioActual) return;
    
    try {
      setLoading(true);
      await registrarPagoServicio(
        servicioActual.id,
        parseFloat(monto) || 0,
        fecha.toISOString()
      );
      
      // Recargar servicios
      const serviciosActualizados = await getServiciosProgresoVersion(selectedVersion);
      setServicios(serviciosActualizados);
      
      // Actualizar resumen
      const resumenActualizado = await getResumenProgresoPlan(selectedPlan);
      setResumen(resumenActualizado);
      
      // Limpiar estado del diálogo
      setServicioActual(null);
      setFecha(new Date());
      setMonto('');
    } catch (error) {
      console.error('Error al registrar el pago:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Obtener detalles de un servicio
  const getServicioDetalle = (zonaId: string) => {
    return servicioDetalles.find(d => d.id === zonaId) || null;
  };
  
  // Formatear fecha
  const formatFecha = (fechaString: string | undefined) => {
    if (!fechaString) return 'N/A';
    
    try {
      return format(new Date(fechaString), 'dd/MM/yyyy', { locale: es });
    } catch (e) {
      return 'Fecha inválida';
    }
  };
  
  // Calcular progreso como porcentaje
  const calcularPorcentaje = () => {
    if (resumen.total === 0) return 0;
    return Math.round((resumen.completados / resumen.total) * 100);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Seguimiento de Tratamientos</h2>
      
      {loading && planes.length === 0 ? (
        <div className="flex justify-center">
          <p>Cargando planes de tratamiento...</p>
        </div>
      ) : planes.length === 0 ? (
        <div className="text-center p-6 border rounded-lg bg-slate-50">
          <p className="text-slate-600">No hay planes de tratamiento para este paciente.</p>
        </div>
      ) : (
        <>
          {/* Selector de plan y versión */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan">Plan de Tratamiento</Label>
              <Select value={selectedPlan} onValueChange={handleChangePlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar plan" />
                </SelectTrigger>
                <SelectContent>
                  {planes.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {format(new Date(plan.fecha), 'dd/MM/yyyy', { locale: es })} - ${plan.costo_total.toLocaleString('es-MX')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="version">Versión del Plan</Label>
              <Select value={selectedVersion} onValueChange={setSelectedVersion} disabled={!selectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar versión" />
                </SelectTrigger>
                <SelectContent>
                  {selectedPlan && 
                    planes
                      .find(p => p.id === selectedPlan)?.versiones?.map(version => (
                        <SelectItem key={version.id} value={version.id}>
                          {version.nombre} {version.activa ? '(Activa)' : ''}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Resumen de progreso */}
          {selectedPlan && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">Total Servicios</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{resumen.total}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">Servicios Completados</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">{resumen.completados}</p>
                  <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: `${calcularPorcentaje()}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{calcularPorcentaje()}% completado</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">Servicios Pendientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-amber-600">{resumen.pendientes}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">Ingresos por Servicios</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600">
                    ${resumen.totalMontoPagado.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Lista de servicios */}
          {selectedVersion && (
            <Card>
              <CardHeader>
                <CardTitle>Servicios del Tratamiento</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center p-4">
                    <p>Cargando servicios...</p>
                  </div>
                ) : servicios.length === 0 ? (
                  <div className="text-center p-4 border rounded-lg bg-slate-50">
                    <p className="text-slate-600">No hay servicios registrados para esta versión del plan.</p>
                  </div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Pagado</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {servicios.map(servicio => {
                          const detalle = getServicioDetalle(servicio.zona_tratamiento_id);
                          
                          return (
                            <tr key={servicio.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {detalle ? (
                                  <div>
                                    <div className="font-medium">{detalle.nombre_tratamiento}</div>
                                    <div className="text-sm text-gray-500">
                                      Costo: ${parseFloat(detalle.costo).toLocaleString('es-MX')}
                                    </div>
                                  </div>
                                ) : (
                                  <span>Servicio desconocido</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={cn(
                                  "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                                  servicio.estado === 'completado' && "bg-green-100 text-green-800",
                                  servicio.estado === 'pendiente' && "bg-amber-100 text-amber-800",
                                  servicio.estado === 'cancelado' && "bg-red-100 text-red-800"
                                )}>
                                  {servicio.estado === 'completado' ? 'Completado' : 
                                   servicio.estado === 'pendiente' ? 'Pendiente' : 'Cancelado'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {formatFecha(servicio.fecha_realizacion)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                ${parseFloat(servicio.monto_pagado.toString()).toLocaleString('es-MX')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex space-x-2">
                                  {servicio.estado === 'pendiente' && (
                                    <>
                                      {/* Marcar como completado */}
                                      <Dialog>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          className="flex items-center gap-1 text-green-600 hover:text-green-700 border-green-200 hover:border-green-300 hover:bg-green-50"
                                          onClick={() => {
                                            setServicioActual(servicio);
                                            setFecha(new Date());
                                            setMonto(detalle ? detalle.costo : '0');
                                            setNotas('');
                                          }}
                                        >
                                          <CheckCircle2 size={14} />
                                          <span>Completar</span>
                                        </Button>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>Completar Servicio</DialogTitle>
                                            <DialogDescription>
                                              Registre los detalles del servicio completado.
                                            </DialogDescription>
                                          </DialogHeader>
                                          
                                          <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                              <Label htmlFor="fecha">Fecha de realización</Label>
                                              <Popover>
                                                <PopoverTrigger>
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
                                          </div>
                                          
                                          <DialogFooter>
                                            <Button variant="outline" onClick={() => setServicioActual(null)}>
                                              Cancelar
                                            </Button>
                                            <Button 
                                              onClick={handleCompletarServicio}
                                              disabled={loading}
                                              className="bg-green-600 hover:bg-green-700"
                                            >
                                              {loading ? 'Guardando...' : 'Confirmar'}
                                            </Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      </Dialog>
                                      
                                      {/* Marcar como cancelado */}
                                      <AlertDialog>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          className="flex items-center gap-1 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
                                          onClick={() => {
                                            setServicioActual(servicio);
                                            setNotas('');
                                          }}
                                        >
                                          <XCircle size={14} />
                                          <span>Cancelar</span>
                                        </Button>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Cancelar Servicio</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              ¿Está seguro que desea cancelar este servicio? Esta acción puede ser revertida después.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          
                                          <div className="grid gap-2 py-4">
                                            <Label htmlFor="notasCancelacion">Motivo de cancelación</Label>
                                            <Textarea
                                              id="notasCancelacion"
                                              value={notas}
                                              onChange={(e) => setNotas(e.target.value)}
                                              placeholder="Indique el motivo de la cancelación"
                                              rows={3}
                                            />
                                          </div>
                                          
                                          <AlertDialogFooter>
                                            <AlertDialogCancel onClick={() => setServicioActual(null)}>
                                              No, volver atrás
                                            </AlertDialogCancel>
                                            <AlertDialogAction 
                                              onClick={handleCancelarServicio}
                                              className="bg-red-600 hover:bg-red-700"
                                            >
                                              {loading ? 'Procesando...' : 'Sí, cancelar servicio'}
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </>
                                  )}
                                  
                                  {/* Registrar pago (disponible para cualquier estado) */}
                                  <Dialog>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                                      onClick={() => {
                                        setServicioActual(servicio);
                                        setFecha(new Date());
                                        setMonto(servicio.monto_pagado ? servicio.monto_pagado.toString() : (detalle ? detalle.costo : '0'));
                                      }}
                                    >
                                      <DollarSign size={14} />
                                      <span>Pago</span>
                                    </Button>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Registrar Pago</DialogTitle>
                                        <DialogDescription>
                                          Ingrese el monto y la fecha del pago.
                                        </DialogDescription>
                                      </DialogHeader>
                                      
                                      <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                          <Label htmlFor="fechaPago">Fecha de pago</Label>
                                          <Popover>
                                            <PopoverTrigger>
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
                                      
                                      <DialogFooter>
                                        <Button variant="outline" onClick={() => setServicioActual(null)}>
                                          Cancelar
                                        </Button>
                                        <Button 
                                          onClick={handleRegistrarPago}
                                          disabled={loading}
                                          className="bg-blue-600 hover:bg-blue-700"
                                        >
                                          {loading ? 'Registrando...' : 'Registrar Pago'}
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
} 