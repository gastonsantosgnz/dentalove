"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Printer, Download, Copy, PlusCircle, Check, X } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ToothStatus } from "./DentalChart"
import { Servicio } from "./ToothStatus"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { useConsultorio } from "@/contexts/ConsultorioContext"
import Image from "next/image"

// Función para formatear cantidades con separadores de miles sin decimales
const formatNumberWithCommas = (amount: number): string => {
  return amount.toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

// Helper function to check if a key represents a general area
const isGeneralAreaKey = (key: string): boolean => {
  return ["boca-completa", "arco-superior", "arco-inferior", "supernumerario"].includes(key);
}

// Helper function to get descriptive name for area keys
const getAreaName = (key: string): string => {
  return {
    "boca-completa": "Boca Completa",
    "arco-superior": "Arco Superior",
    "arco-inferior": "Arco Inferior",
    "supernumerario": "Diente Supernumerario"
  }[key] || key; // Return key itself if not a special area
}

interface TreatmentReportProps {
  toothStatus: Record<string, ToothStatus[]>
  patientName?: string
  servicios?: Servicio[]
  planVersions?: { id: string; nombre: string; toothStatus: Record<string, ToothStatus[]>; totalCost: number; isActive: boolean; editableCosts?: Record<string, number> }[]
  activeVersionId?: string
  onVersionChange?: (versionId: string) => void
  customCosts?: Record<string, number>
  isPlanSaved?: boolean
  initialToothComments?: Record<string, string>
}

export default function TreatmentReport({
  toothStatus,
  patientName = "Paciente",
  servicios = [],
  planVersions = [],
  activeVersionId = "",
  onVersionChange,
  customCosts = {},
  isPlanSaved = true,
  initialToothComments = {}
}: TreatmentReportProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const { consultorio } = useConsultorio()
  const currentDate = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  
  const [selectedVersionId, setSelectedVersionId] = useState<string>("") 
  
  useEffect(() => {
    if (open && activeVersionId) {
      setSelectedVersionId(activeVersionId);
    }
  }, [open, activeVersionId]);
  
  const reportToothStatus = useMemo(() => {
    if (!planVersions.length || !selectedVersionId) {
      return toothStatus;
    }
    
    const selectedVersion = planVersions.find(v => v.id === selectedVersionId);
    return selectedVersion ? selectedVersion.toothStatus : toothStatus;
  }, [toothStatus, planVersions, selectedVersionId]);
  
  // Use useMemo to prevent unnecessary re-renders with empty comment objects
  const [toothComments, setToothComments] = useState<Record<string, string>>(
    useMemo(() => initialToothComments || {}, [initialToothComments])
  )
  const [editingCommentTooth, setEditingCommentTooth] = useState<string | null>(null)
  const [currentComment, setCurrentComment] = useState("")

  const calculateSelectedPlanTotal = () => {
    if (planVersions.length && selectedVersionId) {
      const selectedVersion = planVersions.find(v => v.id === selectedVersionId);
      if (selectedVersion) {
        return selectedVersion.totalCost;
      }
    }
    
    let total = 0;
    
    Object.entries(generalAreaTreatments).forEach(([treatment, data]) => {
      const cost = getServiceCost(data.servicio_id, treatment);
      total += cost || 0;
    });
    
    Object.entries(specificToothTreatments).forEach(([treatment, data]) => {
      const cost = getServiceCost(data.servicio_id, treatment);
      total += (cost || 0) * data.teeth.length;
    });
    
    return total;
  };

  const handleActivateVersion = () => {
    if (onVersionChange && selectedVersionId) {
      onVersionChange(selectedVersionId);
      
      toast({
        title: "Versión activada",
        description: "Se ha cambiado a la versión seleccionada",
        duration: 3000,
      });
    }
  };

  const specificToothTreatments: Record<string, { teeth: string[]; color: string; servicio_id?: string | null }> = {};
  const generalAreaTreatments: Record<string, { areas: string[]; color: string; servicio_id?: string | null }> = {};

  Object.entries(reportToothStatus).forEach(([key, statuses]) => {
    statuses?.filter(s => s.type === 'treatment').forEach(status => {
      const treatmentName = status.status;
      const color = status.color;
      const servicioId = status.servicio_id;

      if (isGeneralAreaKey(key)) {
        if (!generalAreaTreatments[treatmentName]) {
          generalAreaTreatments[treatmentName] = { areas: [], color: color, servicio_id: servicioId };
        }
        if (!generalAreaTreatments[treatmentName].areas.includes(key)) {
          generalAreaTreatments[treatmentName].areas.push(key);
        }
      } else {
        if (!specificToothTreatments[treatmentName]) {
          specificToothTreatments[treatmentName] = { teeth: [], color: color, servicio_id: servicioId };
        }
        if (!specificToothTreatments[treatmentName].teeth.includes(key)) {
          specificToothTreatments[treatmentName].teeth.push(key);
        }
      }
    });
  });

  const conditionGroups: Record<string, { teeth: string[] }> = {}
  Object.entries(reportToothStatus).forEach(([tooth, statuses]) => {
    if (isGeneralAreaKey(tooth)) return;
    statuses?.filter((s) => s.type === "condition").forEach((status) => {
        if (!conditionGroups[status.status]) {
          conditionGroups[status.status] = { teeth: [] }
        }
        if (!conditionGroups[status.status].teeth.includes(tooth)) {
          conditionGroups[status.status].teeth.push(tooth)
        }
      })
  })

  const handleCommentClick = (key: string) => {
    setEditingCommentTooth(key)
    setCurrentComment(toothComments[key] || "")
  }

  const handleSaveComment = () => {
    if (editingCommentTooth) {
      setToothComments(prev => ({ ...prev, [editingCommentTooth!]: currentComment }))
      setEditingCommentTooth(null)
      setCurrentComment("")
    }
  }

  const handleCancelComment = () => {
    setEditingCommentTooth(null)
    setCurrentComment("")
  }

  const getServiceCost = (servicioId: string | null | undefined, treatmentName: string, tooth?: string) => {
    // Primero, buscar en customCosts para ese diente y servicioId específico
    if (tooth && servicioId) {
      const customKey = `${tooth}_${servicioId}`;
      if (customCosts[customKey] !== undefined) {
        return customCosts[customKey];
      }
    }
    
    // Luego, buscar en editableCosts si existe
    if (editableCosts[treatmentName] !== undefined) {
      return editableCosts[treatmentName];
    }
    
    // Finalmente, buscar en la lista de servicios
    if (servicioId && servicios.length > 0) {
      const servicio = servicios.find(s => s.id === servicioId);
      if (servicio) {
        return servicio.costo;
      }
    }
    
    return 0;
  };

  const calculateTotalCost = () => {
    return calculateSelectedPlanTotal();
  }

  const handlePrint = () => {
    const reportContent = document.getElementById("current-report-content");
    if (reportContent) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        const planContent = document.querySelector('[data-value="plan"]');
        const planHtml = planContent ? (planContent as HTMLElement).outerHTML : '';
        
        const tailwindCssUrl = "https://cdn.tailwindcss.com"; 
        printWindow.document.write(`
          <html>
            <head>
              <title>Reporte Dental - ${patientName}</title>
              <script src="${tailwindCssUrl}"></script> 
              <style>
                body { 
                  -webkit-print-color-adjust: exact !important; 
                  print-color-adjust: exact !important;
                  margin: 0;
                  padding: 0;
                }
                
                .print-container {
                  padding: 10px;
                }
                
                .report-header {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 10px;
                }
                
                .treatment-copy {
                  padding: 10px 0;
                  page-break-inside: avoid;
                  font-size: 0.9em;
                }
                
                .second-copy {
                  margin-top: 20px;
                  border-top: 1px dashed #ccc;
                  padding-top: 15px;
                }
                
                th, td { 
                  padding: 4px !important;
                  font-size: 0.8em !important;
                }
                
                .smaller-text {
                  font-size: 0.9em;
                }
                
                .logo-container {
                  display: flex;
                  align-items: center;
                  gap: 10px;
                }
                
                .logo-image {
                  max-height: 50px;
                  max-width: 80px;
                  object-fit: contain;
                }
                
                @media print {
                  .no-print { display: none; }
                  
                  .print-page {
                    page-break-after: always;
                    max-height: 100vh;
                  }
                }
              </style>
            </head>
            <body>
              <div class="print-page">
                <div class="print-container">
                  <div class="report-header">
                    <div class="logo-container">
                      ${consultorio && consultorio.logo ? 
                        `<img src="${consultorio.logo}" alt="${consultorio.nombre || 'Consultorio'}" class="logo-image" onerror="this.style.display='none'" />` : 
                        ''
                      }
                      <div>
                        <h3 class="text-lg font-bold">${consultorio ? consultorio.nombre : 'Dentalove'}</h3>
                        <p class="text-sm text-muted-foreground">Reporte generado el ${currentDate}</p>
                      </div>
                    </div>
                    <div style="text-align: right;">
                      <h3 class="text-lg font-bold">Paciente: ${patientName}</h3>
                    </div>
                  </div>
                  
                  <div class="treatment-copy">
                    <h3 class="text-md font-semibold mb-2">Plan de Tratamiento Actual</h3>
                    ${planHtml || reportContent.innerHTML}
                  </div>
                  
                  <div class="treatment-copy second-copy">
                    <div class="report-header">
                      <div class="logo-container">
                        ${consultorio && consultorio.logo ? 
                          `<img src="${consultorio.logo}" alt="${consultorio.nombre || 'Consultorio'}" class="logo-image" onerror="this.style.display='none'" />` : 
                          ''
                        }
                        <div>
                          <h3 class="text-lg font-bold">${consultorio ? consultorio.nombre : 'Dentalove'}</h3>
                          <p class="text-sm text-muted-foreground">Reporte generado el ${currentDate}</p>
                        </div>
                      </div>
                      <div style="text-align: right;">
                        <h3 class="text-lg font-bold">Paciente: ${patientName}</h3>
                      </div>
                    </div>
                    
                    <h3 class="text-md font-semibold mb-2">Plan de Tratamiento Actual</h3>
                    ${planHtml || reportContent.innerHTML}
                  </div>
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 500);
      }
    }
    setOpen(false);
    
    toast({
      title: "Reporte enviado a imprimir",
      description: "Se ha enviado el reporte a la cola de impresión",
      duration: 3000,
    });
  }
  
  const handleCopyToClipboard = () => {
    let text = `Reporte Dental - ${consultorio ? consultorio.nombre : 'Dentalove'}\nPaciente: ${patientName}\nFecha: ${currentDate}\n\n`;

    // Ahora combinamos diagnóstico y plan de tratamiento en una sola sección
    text += "== PLAN DE TRATAMIENTO ==\n";
    
    // Primero añadimos los tratamientos
    text += "\nTratamientos:\n";
    if (hasGeneralTreatments) {
      text += "\n- Tratamientos Generales:\n";
      Object.entries(generalAreaTreatments).forEach(([treatment, data]) => {
        const cost = getServiceCost(data.servicio_id, treatment);
        text += `  • ${treatment} (Aplicación: ${data.areas.map(getAreaName).join(", ")}) - \$${formatNumberWithCommas(cost)}\n`;
      });
    }
    if (hasSpecificTreatments) {
      text += "\n- Tratamientos por Diente:\n";
      Object.entries(specificToothTreatments).forEach(([treatment, data]) => {
        const cost = getServiceCost(data.servicio_id, treatment);
        const subtotal = cost * data.teeth.length;
        text += `  • ${treatment} (Dientes: ${data.teeth.join(", ")}) - \$${formatNumberWithCommas(cost)} x ${data.teeth.length} = \$${formatNumberWithCommas(subtotal)}\n`;
      });
    }
    if (!hasAnyTreatments) {
      text += "  No se han registrado tratamientos necesarios.\n";
    }
    text += `\nTotal Estimado: \$${formatNumberWithCommas(calculateTotalCost())}\n`;
    
    // Luego añadimos el diagnóstico al final
    if (hasConditions) {
      text += "\nDiagnóstico:\n";
      Object.entries(toothStatus)
        .filter(([key, statuses]) => !isGeneralAreaKey(key) && statuses?.some(s => s.type === "condition"))
        .forEach(([tooth, statuses]) => {
          text += `\nDiente ${tooth} (${getToothInfo(tooth).name}):\n`;
          statuses?.filter(s => s.type === "condition").forEach(status => {
            text += `- ${status.status}\n`;
          });
          if (toothComments[tooth]) {
            text += `  Comentario: ${toothComments[tooth]}\n`;
          }
        });
    }
    
    navigator.clipboard.writeText(text);
    
    toast({
      title: "Copiado al portapapeles",
      description: "El reporte ha sido copiado como texto",
      duration: 3000,
    });
  }
  
  const handleDownloadPDF = () => {
    console.log("Función de descarga PDF no implementada");
    
    toast({
      title: "Función no implementada",
      description: "La descarga de PDF aún no está disponible",
      variant: "destructive",
      duration: 5000,
    });
  }

  const hasConditions = Object.keys(conditionGroups).length > 0
  const hasSpecificTreatments = Object.keys(specificToothTreatments).length > 0
  const hasGeneralTreatments = Object.keys(generalAreaTreatments).length > 0
  const hasAnyTreatments = hasSpecificTreatments || hasGeneralTreatments
  
  const hasMultipleVersions = planVersions.length > 1;

  const getToothInfo = (toothNumber: string) => {
    const toothMap: Record<string, { name: string; type: string }> = {
      "11": { name: "Incisivo central superior derecho", type: "Incisivo" },
      "12": { name: "Incisivo lateral superior derecho", type: "Incisivo" },
      "13": { name: "Canino superior derecho", type: "Canino" },
      "14": { name: "Primer premolar superior derecho", type: "Premolar" },
      "15": { name: "Segundo premolar superior derecho", type: "Premolar" },
      "16": { name: "Primer molar superior derecho", type: "Molar" },
      "17": { name: "Segundo molar superior derecho", type: "Molar" },
      "18": { name: "Tercer molar superior derecho", type: "Molar" },

      "21": { name: "Incisivo central superior izquierdo", type: "Incisivo" },
      "22": { name: "Incisivo lateral superior izquierdo", type: "Incisivo" },
      "23": { name: "Canino superior izquierdo", type: "Canino" },
      "24": { name: "Primer premolar superior izquierdo", type: "Premolar" },
      "25": { name: "Segundo premolar superior izquierdo", type: "Premolar" },
      "26": { name: "Primer molar superior izquierdo", type: "Molar" },
      "27": { name: "Segundo molar superior izquierdo", type: "Molar" },
      "28": { name: "Tercer molar superior izquierdo", type: "Molar" },

      "31": { name: "Incisivo central inferior izquierdo", type: "Incisivo" },
      "32": { name: "Incisivo lateral inferior izquierdo", type: "Incisivo" },
      "33": { name: "Canino inferior izquierdo", type: "Canino" },
      "34": { name: "Primer premolar inferior izquierdo", type: "Premolar" },
      "35": { name: "Segundo premolar inferior izquierdo", type: "Premolar" },
      "36": { name: "Primer molar inferior izquierdo", type: "Molar" },
      "37": { name: "Segundo molar inferior izquierdo", type: "Molar" },
      "38": { name: "Tercer molar inferior izquierdo", type: "Molar" },

      "41": { name: "Incisivo central inferior derecho", type: "Incisivo" },
      "42": { name: "Incisivo lateral inferior derecho", type: "Incisivo" },
      "43": { name: "Canino inferior derecho", type: "Canino" },
      "44": { name: "Primer premolar inferior derecho", type: "Premolar" },
      "45": { name: "Segundo premolar inferior derecho", type: "Premolar" },
      "46": { name: "Primer molar inferior derecho", type: "Molar" },
      "47": { name: "Segundo molar inferior derecho", type: "Molar" },
      "48": { name: "Tercer molar inferior derecho", type: "Molar" },

      "51": { name: "Incisivo central superior derecho (temporal)", type: "Incisivo" },
      "52": { name: "Incisivo lateral superior derecho (temporal)", type: "Incisivo" },
      "53": { name: "Canino superior derecho (temporal)", type: "Canino" },
      "54": { name: "Primer molar superior derecho (temporal)", type: "Molar" },
      "55": { name: "Segundo molar superior derecho (temporal)", type: "Molar" },

      "61": { name: "Incisivo central superior izquierdo (temporal)", type: "Incisivo" },
      "62": { name: "Incisivo lateral superior izquierdo (temporal)", type: "Incisivo" },
      "63": { name: "Canino superior izquierdo (temporal)", type: "Canino" },
      "64": { name: "Primer molar superior izquierdo (temporal)", type: "Molar" },
      "65": { name: "Segundo molar superior izquierdo (temporal)", type: "Molar" },

      "71": { name: "Incisivo central inferior izquierdo (temporal)", type: "Incisivo" },
      "72": { name: "Incisivo lateral inferior izquierdo (temporal)", type: "Incisivo" },
      "73": { name: "Canino inferior izquierdo (temporal)", type: "Canino" },
      "74": { name: "Primer molar inferior izquierdo (temporal)", type: "Molar" },
      "75": { name: "Segundo molar inferior izquierdo (temporal)", type: "Molar" },

      "81": { name: "Incisivo central inferior derecho (temporal)", type: "Incisivo" },
      "82": { name: "Incisivo lateral inferior derecho (temporal)", type: "Incisivo" },
      "83": { name: "Canino inferior derecho (temporal)", type: "Canino" },
      "84": { name: "Primer molar inferior derecho (temporal)", type: "Molar" },
      "85": { name: "Segundo molar inferior derecho (temporal)", type: "Molar" },
    }
    return toothMap[toothNumber] || { name: `Diente ${toothNumber}`, type: "Desconocido" }
  }

  // Agregar el estado de editable costs en el componente
  const [editableCosts, setEditableCosts] = useState<Record<string, number>>({})
  const [editingCostTreatment, setEditingCostTreatment] = useState<string | null>(null)
  const [currentCostValue, setCurrentCostValue] = useState("")

  const handleCostClick = (treatment: string) => {
    setEditingCostTreatment(treatment)
    const currentDisplayCost = editableCosts[treatment] ?? 0;
    setCurrentCostValue(currentDisplayCost.toString());
  }

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentCostValue(e.target.value)
  }

  const handleSaveCost = (treatment: string) => {
    const newCost = parseFloat(currentCostValue)
    if (!isNaN(newCost)) {
      setEditableCosts(prev => ({ ...prev, [treatment]: newCost }))
    }
    setEditingCostTreatment(null)
  }

  const handleCostBlur = (treatment: string) => {
    handleSaveCost(treatment)
  }

  return (
    <>
      <Button 
        variant="outline"
        className={`flex items-center gap-2 ${
          isPlanSaved 
            ? "bg-slate-900 text-white hover:bg-slate-800 hover:text-white" 
            : "bg-slate-400 text-white hover:bg-slate-400 hover:text-white cursor-not-allowed"
        }`}
        onClick={() => {
          if (!isPlanSaved) {
            // Show alert when plan is not saved
            toast({
              title: "Plan no guardado",
              description: "Es necesario guardar el plan antes de generar el reporte.",
              variant: "destructive",
              duration: 5000,
            });
            return;
          }
          setOpen(true);
        }}
        aria-disabled={!isPlanSaved}
      >
        <Printer className="h-4 w-4" />
        Generar Reporte
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-none min-w-[500px] w-[45vw] max-h-[90vh] overflow-y-auto sm:max-w-[45vw] p-4 sm:p-6">
          <DialogHeader className="mb-2">
            <DialogTitle>Reporte del Plan de Tratamiento Actual</DialogTitle>
            <DialogDescription>Resumen del estado dental y tratamientos en curso</DialogDescription>
          </DialogHeader>

          {hasMultipleVersions && (
            <div className="flex flex-col space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="versionSelector" className="text-sm font-medium">
                    Seleccione versión del plan:
                  </Label>
                </div>
                {selectedVersionId !== activeVersionId && onVersionChange && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleActivateVersion}
                    className="text-xs"
                  >
                    Activar esta versión
                  </Button>
                )}
              </div>
              <select
                id="versionSelector"
                className="w-full px-3 py-2 rounded-md border text-sm"
                value={selectedVersionId}
                onChange={(e) => setSelectedVersionId(e.target.value)}
              >
                {planVersions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {version.nombre} {version.isActive ? "(actual)" : ""} - ${Math.round(version.totalCost).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Tabs defaultValue="plan" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="plan">Plan de Tratamiento</TabsTrigger>
              {hasMultipleVersions && (
                <TabsTrigger value="comparison">Comparar Versiones</TabsTrigger>
              )}
            </TabsList>

            <div id="current-report-content" className="space-y-6 print:space-y-4 print:p-0 w-full">
              <div className="flex justify-between items-start mt-4 print:mt-0 w-full">
                <div className="flex items-center gap-2">
                  {consultorio && consultorio.logo && (
                    <div className="w-10 h-10 relative overflow-hidden">
                      <Image 
                        src={consultorio.logo} 
                        alt={consultorio.nombre || "Logo consultorio"}
                        width={40}
                        height={40}
                        className="object-contain w-full h-full"
                        onError={(e) => {
                          // Manejar error cuando la imagen no carga
                          const imgElement = e.target as HTMLImageElement;
                          imgElement.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold">{consultorio ? consultorio.nombre : 'Dentalove'}</h3>
                    <p className="text-sm text-muted-foreground">Reporte generado el {currentDate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-bold">Paciente: {patientName}</h3>
                  {hasMultipleVersions && selectedVersionId && (
                    <p className="text-sm text-muted-foreground">
                      Versión: {planVersions.find(v => v.id === selectedVersionId)?.nombre || ""}
                    </p>
                  )}
                </div>
              </div>

              <TabsContent value="plan" data-value="plan" className="mt-0">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-md font-semibold mb-2">Plan de Tratamiento Detallado</h3>

                    {!hasAnyTreatments ? (
                      <p className="text-sm text-muted-foreground print:text-gray-600">No se han registrado tratamientos necesarios.</p>
                    ) : (
                      <div className="space-y-4">
                        {hasGeneralTreatments && (
                          <div className="mb-4 print:mb-3 w-full">
                            <h4 className="text-sm font-semibold mb-1">Tratamientos Generales</h4>
                            <table className="w-full border-collapse text-xs sm:text-sm print:text-xs">
                              <thead>
                                <tr className="bg-muted print:bg-gray-100">
                                  <th className="text-left p-2 print:p-1.5">Tratamiento</th>
                                  <th className="text-left p-2 print:p-1.5">Aplicación</th>
                                  <th className="text-left p-2 print:p-1.5">Costo Unitario</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(generalAreaTreatments).map(([treatment, data]) => (
                                  <tr key={treatment} className="border-b print:border-gray-300">
                                    <td className="p-2 print:p-1.5">
                                      <div className="flex items-center">
                                        <span
                                          className="inline-block w-3 h-3 rounded-full mr-2 flex-shrink-0 print:w-2 print:h-2"
                                          style={{ backgroundColor: data.color }}
                                        />
                                        <span>{treatment}</span>
                                      </div>
                                    </td>
                                    <td className="p-2 print:p-1.5">{data.areas.map(getAreaName).join(", ")}</td>
                                    <td className="p-2 whitespace-nowrap print:p-1.5" onClick={() => handleCostClick(treatment)} style={{ cursor: 'pointer' }}>
                                      {editingCostTreatment === treatment ? (
                                        <Input 
                                          type="number" 
                                          value={currentCostValue}
                                          onChange={handleCostChange}
                                          onBlur={() => handleCostBlur(treatment)}
                                          className="h-6 text-xs w-16 no-print"
                                          style={{ appearance: 'textfield' }}
                                          autoFocus
                                        />
                                      ) : (
                                        <span>${formatNumberWithCommas(getServiceCost(data.servicio_id, treatment))}</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {hasSpecificTreatments && (
                          <div className="print:mt-3 w-full">
                            <h4 className="text-sm font-semibold mb-1">Tratamientos por Diente</h4>
                            <table className="w-full border-collapse text-xs sm:text-sm print:text-xs">
                              <thead>
                                <tr className="bg-muted print:bg-gray-100">
                                  <th className="text-left p-2 print:p-1.5">Tratamiento</th>
                                  <th className="text-left p-2 print:p-1.5">Dientes</th>
                                  <th className="text-left p-2 print:p-1.5">Costo Unitario</th>
                                  <th className="text-left p-2 print:p-1.5">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(specificToothTreatments).map(([treatment, data]) => {
                                  // Calcular el costo considerando cada diente individualmente
                                  let totalCost = 0;
                                  data.teeth.forEach(tooth => {
                                    totalCost += getServiceCost(data.servicio_id, treatment, tooth);
                                  });
                                  const avgCost = data.teeth.length > 0 ? totalCost / data.teeth.length : 0;
                                  
                                  return (
                                    <tr key={treatment} className="border-b print:border-gray-300">
                                      <td className="p-2 print:p-1.5">
                                        <div className="flex items-center">
                                          <span
                                            className="inline-block w-3 h-3 rounded-full mr-2 flex-shrink-0 print:w-2 print:h-2"
                                            style={{ backgroundColor: data.color }}
                                          />
                                          <span>{treatment}</span>
                                        </div>
                                      </td>
                                      <td className="p-2 print:p-1.5">{data.teeth.join(", ")}</td>
                                      <td className="p-2 whitespace-nowrap print:p-1.5" onClick={() => handleCostClick(treatment)} style={{ cursor: 'pointer' }}>
                                        {editingCostTreatment === treatment ? (
                                          <Input 
                                            type="number" 
                                            value={currentCostValue}
                                            onChange={handleCostChange}
                                            onBlur={() => handleCostBlur(treatment)}
                                            className="h-6 text-xs w-16 no-print"
                                            style={{ appearance: 'textfield' }}
                                            autoFocus
                                          />
                                        ) : (
                                          <span>${formatNumberWithCommas(avgCost)}</span>
                                        )}
                                      </td>
                                      <td className="p-2 whitespace-nowrap print:p-1.5">
                                        ${formatNumberWithCommas(totalCost)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}

                        <div className="flex justify-end pt-4 border-t print:pt-2 print:border-gray-300">
                          <div className="text-right">
                            <p className="font-medium text-sm print:text-xs">Total Estimado:</p>
                            <p className="text-lg font-bold print:text-base">${formatNumberWithCommas(calculateTotalCost())}</p>
                          </div>
                        </div>

                        {hasConditions && (
                          <div className="mt-6 pt-4 border-t print:mt-4 print:pt-3 print:border-gray-300">
                            <h3 className="text-md font-semibold mb-2">Diagnóstico</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {Object.entries(reportToothStatus)
                                .filter(([key, statuses]) => !isGeneralAreaKey(key) && statuses?.some(s => s.type === "condition"))
                                .map(([tooth, statuses]) => (
                                  <div key={tooth} className="border rounded-md p-2 print:border-gray-300 print:p-2">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="font-medium text-sm">Diente {tooth}</h4>
                                        <div className="text-xs text-muted-foreground print:text-gray-600">{getToothInfo(tooth).name}</div>
                                        
                                        <div className="mt-1">
                                          <ul className="text-xs list-disc pl-4">
                                            {statuses
                                              ?.filter((s) => s.type === "condition")
                                              .map((status) => (
                                                <li key={status.id}>{status.status}</li>
                                              ))}
                                          </ul>
                                        </div>
                                      </div>
                                    </div>
                                    {toothComments[tooth] && (
                                      <div className="mt-1 p-1.5 bg-muted rounded-md text-xs print:bg-gray-100 print:p-1">
                                        <p><strong>Comentario:</strong> {toothComments[tooth]}</p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {hasMultipleVersions && (
                <TabsContent value="comparison" data-value="comparison" className="mt-0">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-md font-semibold mb-2">Comparación de Versiones</h3>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm">
                          <thead>
                            <tr className="bg-muted">
                              <th className="text-left p-2">Descripción</th>
                              {planVersions.map(version => (
                                <th key={version.id} className="text-center p-2">
                                  <div className="flex flex-col items-center">
                                    <span className="font-medium">{version.nombre}</span>
                                    <span className="text-xs font-normal text-muted-foreground">
                                      ${Math.round(version.totalCost).toLocaleString()}
                                    </span>
                                    {version.id === activeVersionId ? (
                                      <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 rounded mt-1">
                                        Actual
                                      </span>
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs h-6 px-1.5 mt-1"
                                        onClick={() => onVersionChange && onVersionChange(version.id)}
                                      >
                                        Activar
                                      </Button>
                                    )}
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="p-2 font-medium">Tratamientos generales</td>
                              {planVersions.map(version => {
                                const generalTreatments: Record<string, string[]> = {};
                                
                                Object.entries(version.toothStatus).forEach(([key, statuses]) => {
                                  if (isGeneralAreaKey(key)) {
                                    statuses?.filter(s => s.type === 'treatment').forEach(status => {
                                      if (!generalTreatments[status.status]) {
                                        generalTreatments[status.status] = [];
                                      }
                                      if (!generalTreatments[status.status].includes(key)) {
                                        generalTreatments[status.status].push(key);
                                      }
                                    });
                                  }
                                });
                                
                                const treatmentCount = Object.keys(generalTreatments).length;
                                
                                return (
                                  <td key={version.id} className="p-2 align-top">
                                    {treatmentCount > 0 ? (
                                      <ul className="list-disc pl-5 space-y-1">
                                        {Object.entries(generalTreatments).map(([treatment, areas]) => (
                                          <li key={treatment}>
                                            <span className="font-medium">{treatment}</span>
                                            <span className="text-muted-foreground"> ({areas.map(getAreaName).join(', ')})</span>
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <span className="text-muted-foreground italic">Ninguno</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                            
                            <tr className="border-b">
                              <td className="p-2 font-medium">Dientes tratados</td>
                              {planVersions.map(version => {
                                const treatedTeeth = Object.entries(version.toothStatus)
                                  .filter(([key, statuses]) => 
                                    !isGeneralAreaKey(key) && 
                                    statuses?.some(s => s.type === 'treatment')
                                  )
                                  .map(([key]) => key);
                                
                                return (
                                  <td key={version.id} className="p-2">
                                    {treatedTeeth.length > 0 ? (
                                      <div>
                                        <span className="font-medium">{treatedTeeth.length} dientes: </span>
                                        <span className="text-muted-foreground">{treatedTeeth.join(', ')}</span>
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground italic">Ninguno</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                            
                            <tr className="border-b">
                              <td className="p-2 font-medium">Costo total estimado</td>
                              {planVersions.map(version => (
                                <td key={version.id} className="p-2 font-bold">
                                  ${Math.round(version.totalCost).toLocaleString()}
                                </td>
                              ))}
                            </tr>
                            
                            {planVersions.length > 1 && (
                              <tr className="border-b bg-muted/30">
                                <td className="p-2 font-medium">Diferencia vs. actual</td>
                                {planVersions.map(version => {
                                  const activeVersion = planVersions.find(v => v.id === activeVersionId);
                                  if (!activeVersion) return <td key={version.id} className="p-2">-</td>;
                                  
                                  const diff = version.totalCost - activeVersion.totalCost;
                                  const isActive = version.id === activeVersionId;
                                  
                                  return (
                                    <td key={version.id} className="p-2">
                                      {isActive ? (
                                        <span className="font-normal text-muted-foreground">-</span>
                                      ) : (
                                        <span className={diff > 0 ? 'text-red-600' : 'text-green-600'}>
                                          {diff > 0 ? '+' : ''}{Math.round(diff).toLocaleString()}
                                        </span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}
            </div>
          </Tabs>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6 no-print pt-4 border-t justify-end">
            <Button variant="outline" onClick={handleCopyToClipboard} className="gap-2">
              <Copy className="h-4 w-4" />
              Copiar
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} className="gap-2">
              <X className="h-4 w-4" />
              Cerrar
            </Button>
            <Button onClick={handlePrint} className="gap-2 bg-slate-900 text-white hover:bg-slate-800 hover:text-white">
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 