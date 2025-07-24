import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Check, XCircle, CheckCircle2, DollarSign } from "lucide-react";
import { ServicioProgreso } from "@/lib/serviciosProgresoService";
import { Servicio } from "@/components/ToothStatus";
import { ToothStatus } from "@/components/DentalChart";
import { getAreaName, getServiceCost } from "./utils";
import { formatDate } from "../../../lib/formatDate";

interface GeneralTreatmentsTableProps {
  generalAreaTreatments: Record<string, { areas: string[]; color: string; servicio_id?: string | null }>;
  servicios: Servicio[];
  toothStatus: Record<string, ToothStatus[]>;
  findServicioProgreso: (zonaId: string, servicioId: string | null | undefined) => ServicioProgreso | undefined;
  onCompletarClick: (params: {
    zona: string;
    nombreServicio: string;
    zonaId: string;
    servicioId: string | null | undefined;
    esGeneral: boolean;
    costo: number;
  }) => void;
  onCancelarClick: (params: {
    zona: string;
    nombreServicio: string;
    zonaId: string;
    servicioId: string | null | undefined;
    esGeneral: boolean;
    costo: number;
  }) => void;
  onPagoClick: (params: {
    zona: string;
    nombreServicio: string;
    zonaId: string;
    servicioId: string | null | undefined;
    esGeneral: boolean;
    costo: number;
  }) => void;
  planFecha: string;
}

export function GeneralTreatmentsTable({
  generalAreaTreatments,
  servicios,
  toothStatus,
  findServicioProgreso,
  onCompletarClick,
  onCancelarClick,
  onPagoClick,
  planFecha
}: GeneralTreatmentsTableProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Tratamientos Generales</CardTitle>
        <CardDescription>Tratamientos aplicados a áreas completas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 font-medium">Área</th>
                <th className="text-left py-2 px-3 font-medium">Tratamiento</th>
                <th className="text-right py-2 px-3 font-medium">Costo</th>
                <th className="text-center py-2 px-3 font-medium">Estado</th>
                <th className="text-center py-2 px-3 font-medium">Fecha</th>
                <th className="text-right py-2 px-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(generalAreaTreatments).map(([treatment, data]) => {
                const serviceCost = getServiceCost(data.servicio_id, servicios);
                
                // Crear un ID único para esta zona de tratamiento
                const zonaId = `general-${treatment}-${data.areas.join('-')}`;
                
                // Buscar el ID real del tratamiento para esta área
                let realTreatmentId: string | null = null;
                data.areas.forEach(area => {
                  Object.entries(toothStatus).forEach(([zone, statuses]) => {
                    if (zone === area) { // Si es el área que buscamos
                      statuses.filter(s => s.type === 'treatment' && s.status === treatment).forEach(t => {
                        realTreatmentId = t.id;
                      });
                    }
                  });
                });
                
                // Buscar progreso para este tratamiento
                const progreso = findServicioProgreso(zonaId, data.servicio_id);
                
                return (
                  <tr key={zonaId} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <div className="font-medium">{data.areas.map(getAreaName).join(", ")}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }}></div>
                        <span>{treatment}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      ${serviceCost.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {!progreso || progreso.estado === 'pendiente' ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>Pendiente</span>
                        </Badge>
                      ) : progreso.estado === 'completado' ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                          <Check className="mr-1 h-3 w-3" />
                          <span>Completado</span>
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                          <XCircle className="mr-1 h-3 w-3" />
                          <span>Cancelado</span>
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center text-xs text-slate-600">
                      {planFecha ? formatDate(planFecha, "dd MMM yyyy") : '-'}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex justify-end gap-1">
                        {!progreso || progreso.estado === 'pendiente' ? (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-8 w-8 p-0 text-green-600"
                              onClick={() => onCompletarClick({
                                zona: zonaId,
                                nombreServicio: treatment,
                                zonaId: realTreatmentId || zonaId, // Usar el ID real si existe
                                servicioId: data.servicio_id,
                                esGeneral: true,
                                costo: serviceCost
                              })}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-8 w-8 p-0 text-red-600"
                              onClick={() => onCancelarClick({
                                zona: zonaId,
                                nombreServicio: treatment,
                                zonaId: realTreatmentId || zonaId, // Usar el ID real si existe
                                servicioId: data.servicio_id,
                                esGeneral: true,
                                costo: serviceCost
                              })}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        ) : progreso.estado === 'completado' ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 w-8 p-0 text-blue-600"
                            onClick={() => onPagoClick({
                              zona: zonaId,
                              nombreServicio: treatment,
                              zonaId: realTreatmentId || zonaId, // Usar el ID real si existe
                              servicioId: data.servicio_id,
                              esGeneral: true,
                              costo: serviceCost
                            })}
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 w-8 p-0 text-green-600"
                            onClick={() => onCompletarClick({
                              zona: zonaId,
                              nombreServicio: treatment,
                              zonaId: realTreatmentId || zonaId, // Usar el ID real si existe
                              servicioId: data.servicio_id,
                              esGeneral: true,
                              costo: serviceCost
                            })}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
} 