"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronRight,
  ArrowLeft,
  Settings,
  Package,
  Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useConsultorio } from "@/contexts/ConsultorioContext";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  getCategorias, 
  getSubcategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  createSubcategoria,
  updateSubcategoria,
  deleteSubcategoria,
  CategoriaGasto,
  SubcategoriaGasto
} from "@/lib/gastosService";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriasGastosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { consultorio } = useConsultorio();
  
  const [isLoading, setIsLoading] = useState(true);
  const [categorias, setCategorias] = useState<CategoriaGasto[]>([]);
  const [subcategorias, setSubcategorias] = useState<SubcategoriaGasto[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaGasto | null>(null);
  
  // Dialogs
  const [categoriaDialog, setCategoriaDialog] = useState(false);
  const [subcategoriaDialog, setSubcategoriaDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'categoria' | 'subcategoria', item: any } | null>(null);
  
  // Forms
  const [categoriaForm, setCategoriaForm] = useState({
    id: '',
    nombre: '',
    tipo: 'variable' as 'fijo' | 'variable',
    color: '#3B82F6'
  });
  
  const [subcategoriaForm, setSubcategoriaForm] = useState({
    id: '',
    nombre: '',
    descripcion: ''
  });

  const loadCategorias = useCallback(async () => {
    if (!consultorio) return;
    
    try {
      setIsLoading(true);
      const data = await getCategorias(consultorio.id);
      setCategorias(data);
    } catch (error) {
      console.error("Error loading categorías:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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

  // Cargar datos
  useEffect(() => {
    if (consultorio) {
      loadCategorias();
    }
  }, [consultorio, loadCategorias]);

  useEffect(() => {
    if (selectedCategoria && consultorio) {
      loadSubcategorias(selectedCategoria.id);
    }
  }, [selectedCategoria, consultorio, loadSubcategorias]);

  // Handlers para categorías
  const handleSaveCategoria = async () => {
    if (!consultorio || !categoriaForm.nombre) return;

    try {
      if (categoriaForm.id) {
        // Actualizar
        await updateCategoria(categoriaForm.id, {
          nombre: categoriaForm.nombre,
          tipo: categoriaForm.tipo,
          color: categoriaForm.color
        });
        toast({
          title: "Éxito",
          description: "Categoría actualizada correctamente"
        });
      } else {
        // Crear
        await createCategoria({
          consultorio_id: consultorio.id,
          nombre: categoriaForm.nombre,
          tipo: categoriaForm.tipo,
          color: categoriaForm.color,
          es_predefinida: false,
          orden: categorias.length,
          activa: true
        });
        toast({
          title: "Éxito",
          description: "Categoría creada correctamente"
        });
      }
      
      setCategoriaDialog(false);
      resetCategoriaForm();
      loadCategorias();
    } catch (error) {
      console.error("Error saving categoría:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la categoría",
        variant: "destructive"
      });
    }
  };

  // Handlers para subcategorías
  const handleSaveSubcategoria = async () => {
    if (!consultorio || !selectedCategoria || !subcategoriaForm.nombre) return;

    try {
      if (subcategoriaForm.id) {
        // Actualizar
        await updateSubcategoria(subcategoriaForm.id, {
          nombre: subcategoriaForm.nombre,
          descripcion: subcategoriaForm.descripcion
        });
        toast({
          title: "Éxito",
          description: "Subcategoría actualizada correctamente"
        });
      } else {
        // Crear
        await createSubcategoria({
          categoria_id: selectedCategoria.id,
          consultorio_id: consultorio.id,
          nombre: subcategoriaForm.nombre,
          descripcion: subcategoriaForm.descripcion,
          activa: true
        });
        toast({
          title: "Éxito",
          description: "Subcategoría creada correctamente"
        });
      }
      
      setSubcategoriaDialog(false);
      resetSubcategoriaForm();
      loadSubcategorias(selectedCategoria.id);
    } catch (error) {
      console.error("Error saving subcategoría:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la subcategoría",
        variant: "destructive"
      });
    }
  };

  // Handler para eliminar
  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'categoria') {
        await deleteCategoria(itemToDelete.item.id);
        toast({
          title: "Éxito",
          description: "Categoría eliminada correctamente"
        });
        loadCategorias();
        if (selectedCategoria?.id === itemToDelete.item.id) {
          setSelectedCategoria(null);
          setSubcategorias([]);
        }
      } else {
        await deleteSubcategoria(itemToDelete.item.id);
        toast({
          title: "Éxito",
          description: "Subcategoría eliminada correctamente"
        });
        if (selectedCategoria) {
          loadSubcategorias(selectedCategoria.id);
        }
      }
    } catch (error) {
      console.error("Error deleting:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el elemento",
        variant: "destructive"
      });
    } finally {
      setDeleteDialog(false);
      setItemToDelete(null);
    }
  };

  const resetCategoriaForm = () => {
    setCategoriaForm({
      id: '',
      nombre: '',
      tipo: 'variable',
      color: '#3B82F6'
    });
  };

  const resetSubcategoriaForm = () => {
    setSubcategoriaForm({
      id: '',
      nombre: '',
      descripcion: ''
    });
  };

  const editCategoria = (categoria: CategoriaGasto) => {
    setCategoriaForm({
      id: categoria.id,
      nombre: categoria.nombre,
      tipo: categoria.tipo,
      color: categoria.color || '#3B82F6'
    });
    setCategoriaDialog(true);
  };

  const editSubcategoria = (subcategoria: SubcategoriaGasto) => {
    setSubcategoriaForm({
      id: subcategoria.id,
      nombre: subcategoria.nombre,
      descripcion: subcategoria.descripcion || ''
    });
    setSubcategoriaDialog(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/gastos')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categorías de Gastos</h1>
            <p className="text-muted-foreground">
              Organiza y personaliza las categorías de gastos
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Lista de Categorías */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Categorías</CardTitle>
              <CardDescription>
                Categorías principales de gastos
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => {
                resetCategoriaForm();
                setCategoriaDialog(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : categorias.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay categorías creadas
              </p>
            ) : (
              <div className="space-y-2">
                {categorias.map((categoria) => (
                  <div
                    key={categoria.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCategoria?.id === categoria.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedCategoria(categoria)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: categoria.color || '#6B7280' }}
                        />
                        <div>
                          <p className="font-medium">{categoria.nombre}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {categoria.tipo === 'fijo' ? (
                                <>
                                  <Building2 className="h-3 w-3 mr-1" />
                                  Fijo
                                </>
                              ) : (
                                <>
                                  <Package className="h-3 w-3 mr-1" />
                                  Variable
                                </>
                              )}
                            </Badge>
                            {categoria.es_predefinida && (
                              <Badge variant="secondary" className="text-xs">
                                Predefinida
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!categoria.es_predefinida && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                editCategoria(categoria);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setItemToDelete({ type: 'categoria', item: categoria });
                                setDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Subcategorías */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                {selectedCategoria ? selectedCategoria.nombre : 'Subcategorías'}
              </CardTitle>
              <CardDescription>
                {selectedCategoria 
                  ? 'Subcategorías de esta categoría'
                  : 'Selecciona una categoría para ver sus subcategorías'
                }
              </CardDescription>
            </div>
            {selectedCategoria && (
              <Button
                size="sm"
                onClick={() => {
                  resetSubcategoriaForm();
                  setSubcategoriaDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!selectedCategoria ? (
              <p className="text-center text-muted-foreground py-8">
                Selecciona una categoría para gestionar sus subcategorías
              </p>
            ) : subcategorias.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay subcategorías en esta categoría
              </p>
            ) : (
              <div className="space-y-2">
                {subcategorias.map((subcategoria) => (
                  <div
                    key={subcategoria.id}
                    className="p-3 rounded-lg border hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{subcategoria.nombre}</p>
                        {subcategoria.descripcion && (
                          <p className="text-sm text-muted-foreground">
                            {subcategoria.descripcion}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => editSubcategoria(subcategoria)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setItemToDelete({ type: 'subcategoria', item: subcategoria });
                            setDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog para Categoría */}
      <Dialog open={categoriaDialog} onOpenChange={setCategoriaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {categoriaForm.id ? 'Editar' : 'Nueva'} Categoría
            </DialogTitle>
            <DialogDescription>
              {categoriaForm.id 
                ? 'Modifica los datos de la categoría'
                : 'Crea una nueva categoría de gastos'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={categoriaForm.nombre}
                onChange={(e) => setCategoriaForm(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Equipamiento"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={categoriaForm.tipo}
                onValueChange={(value: 'fijo' | 'variable') => 
                  setCategoriaForm(prev => ({ ...prev, tipo: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fijo">Gasto Fijo</SelectItem>
                  <SelectItem value="variable">Gasto Variable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={categoriaForm.color}
                  onChange={(e) => setCategoriaForm(prev => ({ ...prev, color: e.target.value }))}
                  className="w-20"
                />
                <Input
                  value={categoriaForm.color}
                  onChange={(e) => setCategoriaForm(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="#3B82F6"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoriaDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCategoria}>
              {categoriaForm.id ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Subcategoría */}
      <Dialog open={subcategoriaDialog} onOpenChange={setSubcategoriaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {subcategoriaForm.id ? 'Editar' : 'Nueva'} Subcategoría
            </DialogTitle>
            <DialogDescription>
              {subcategoriaForm.id 
                ? 'Modifica los datos de la subcategoría'
                : `Crea una nueva subcategoría en ${selectedCategoria?.nombre}`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sub-nombre">Nombre</Label>
              <Input
                id="sub-nombre"
                value={subcategoriaForm.nombre}
                onChange={(e) => setSubcategoriaForm(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Equipo dental"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción (opcional)</Label>
              <Input
                id="descripcion"
                value={subcategoriaForm.descripcion}
                onChange={(e) => setSubcategoriaForm(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Descripción breve"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubcategoriaDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSubcategoria}>
              {subcategoriaForm.id ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente 
              {itemToDelete?.type === 'categoria' 
                ? ` la categoría "${itemToDelete.item.nombre}" y todas sus subcategorías`
                : ` la subcategoría "${itemToDelete?.item.nombre}"`
              }.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
} 