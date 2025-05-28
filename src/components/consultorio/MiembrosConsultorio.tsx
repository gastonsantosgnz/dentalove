'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPlus, IconUserPlus, IconUsers, IconX, IconCheck, IconTrash, IconEdit } from "@tabler/icons-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

// Importar los componentes modales
import { InvitarMiembroModal } from './InvitarMiembroModal';
import { EditarRolModal } from './EditarRolModal';
import { EliminarMiembroModal } from './EliminarMiembroModal';

interface Miembro {
  id: string;
  usuario_id: string;
  email: string;
  nombre: string;
  rol: string;
  activo: boolean;
}

// Interfaces para las respuestas de Supabase
interface ConsultorioBasic {
  id: string;
  nombre: string;
}

interface UsuarioConsultorioRecord {
  consultorio_id: string;
  rol: string;
  consultorios: ConsultorioBasic;
}

interface PerfilUsuario {
  nombre: string;
  apellido: string;
}

interface UsuarioWithPerfil {
  nombre: string;
  apellido: string;
}

interface MiembroConsultorioRecord {
  id: string;
  usuario_id: string;
  rol: string;
  activo: boolean;
  usuarios: UsuarioWithPerfil;
}

// Add MiembrosConsultorioSkeleton component
const MiembrosConsultorioSkeleton = ({ showSelector = false }: { showSelector?: boolean }) => {
  return (
    <div className="space-y-6">
      {showSelector && (
        <div className="mb-6">
          <div className="h-5 w-48 bg-gray-200 animate-pulse rounded mb-2"></div>
          <div className="h-10 w-full bg-gray-200 animate-pulse rounded"></div>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <div className="h-6 w-48 bg-gray-200 animate-pulse rounded mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 animate-pulse rounded"></div>
            </div>
            <div className="h-9 w-24 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><div className="h-4 bg-gray-200 w-24 animate-pulse rounded"></div></TableHead>
                  <TableHead><div className="h-4 bg-gray-200 w-32 animate-pulse rounded"></div></TableHead>
                  <TableHead><div className="h-4 bg-gray-200 w-16 animate-pulse rounded"></div></TableHead>
                  <TableHead><div className="h-4 bg-gray-200 w-20 animate-pulse rounded"></div></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><div className="h-5 bg-gray-200 w-32 animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-5 bg-gray-200 w-48 animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-5 bg-gray-200 w-20 animate-pulse rounded"></div></TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <div className="h-8 w-8 bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-8 w-8 bg-gray-200 animate-pulse rounded"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export function MiembrosConsultorio() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [consultorioSeleccionado, setConsultorioSeleccionado] = useState<string>('');
  const [consultorios, setConsultorios] = useState<{ id: string, nombre: string, rol: string }[]>([]);
  
  // Estados para los modales
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditRolDialogOpen, setIsEditRolDialogOpen] = useState(false);
  const [miembroParaEliminar, setMiembroParaEliminar] = useState<Miembro | null>(null);
  const [miembroParaEditar, setMiembroParaEditar] = useState<Miembro | null>(null);

  // Cargar consultorios del usuario
  useEffect(() => {
    const cargarConsultorios = async () => {
      if (!user) return;
      
      // Consultar consultorios a los que pertenece el usuario
      const { data, error } = await supabase
        .from('usuarios_consultorios')
        .select(`
          consultorio_id,
          rol,
          consultorios:consultorio_id(
            id, 
            nombre
          )
        `)
        .eq('usuario_id', user.id)
        .eq('activo', true);
        
      if (error) {
        console.error('Error al cargar consultorios:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los consultorios",
          variant: "destructive"
        });
        return;
      }
      
      // Transformar datos
      const consultoriosData = (data as unknown as UsuarioConsultorioRecord[]).map(item => ({
        id: item.consultorio_id,
        nombre: item.consultorios.nombre,
        rol: item.rol
      }));
      
      setConsultorios(consultoriosData);
      
      // Seleccionar el primer consultorio por defecto
      if (consultoriosData.length > 0 && !consultorioSeleccionado) {
        setConsultorioSeleccionado(consultoriosData[0].id);
      }
    };
    
    cargarConsultorios();
  }, [user, toast, consultorioSeleccionado]);

  // Cargar miembros del consultorio seleccionado
  useEffect(() => {
    const cargarMiembros = async () => {
      if (!consultorioSeleccionado || !user) return;
      
      setLoading(true);
      
      try {
        // Consulta para obtener los miembros del consultorio seleccionado
        const { data, error } = await supabase
          .from('usuarios_consultorios')
          .select(`
            id,
            usuario_id,
            rol,
            activo
          `)
          .eq('consultorio_id', consultorioSeleccionado)
          .eq('activo', true);
          
        if (error) {
          console.error('Error al cargar miembros básicos:', error);
          toast({
            title: "Error",
            description: "No se pudieron cargar los miembros del consultorio",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        // Si no hay miembros, establecer array vacío y terminar
        if (!data || data.length === 0) {
          setMiembros([]);
          setLoading(false);
          return;
        }
        
        // Para cada miembro, obtener sus datos de usuario en consultas separadas
        const miembrosData: Miembro[] = [];
        
        // Obtener perfiles de usuario en una sola consulta
        const usuarioIds = data.map(item => item.usuario_id);
        const { data: perfilesData, error: perfilesError } = await supabase
          .from('perfiles_usuario')
          .select('id, nombre, apellido, email')
          .in('id', usuarioIds);
        
        if (perfilesError) {
          console.error('Error al cargar perfiles:', perfilesError);
        }
        
        // Crear un mapa de usuario_id -> datos de perfil
        const perfilesMap = new Map();
        if (perfilesData) {
          perfilesData.forEach(perfil => {
            perfilesMap.set(perfil.id, perfil);
          });
        }
        
        for (const item of data) {
          try {
            let nombre = 'Usuario sin nombre';
            let email = 'Sin email';
            
            // Obtener datos del perfil del mapa
            const perfil = perfilesMap.get(item.usuario_id);
            if (perfil) {
              if (perfil.nombre || perfil.apellido) {
                nombre = `${perfil.nombre || ''} ${perfil.apellido || ''}`.trim();
              }
              if (perfil.email) {
                email = perfil.email;
              }
            }
            
            // Si es el usuario actual y no tenemos su email del perfil, usar el del contexto de auth
            if (item.usuario_id === user.id && email === 'Sin email') {
              email = user.email || 'Sin email';
              
              // Si es el usuario actual pero no tiene nombre, mostrar uno genérico
              if (nombre === 'Usuario sin nombre') {
                nombre = `Usuario (${user.email || 'Tú'})`;
              }
            }
            
            // Si no se pudo obtener el nombre, usar un identificador genérico
            if (nombre === 'Usuario sin nombre') {
              nombre = `Miembro #${item.usuario_id.substring(0, 8)}`;
            }
              
            miembrosData.push({
              id: item.id,
              usuario_id: item.usuario_id,
              email,
              nombre: nombre || email,
              rol: item.rol,
              activo: item.activo
            });
          } catch (err) {
            console.warn(`Error al procesar miembro ${item.usuario_id}:`, err);
            
            // Añadir el miembro de todas formas con datos genéricos
            miembrosData.push({
              id: item.id,
              usuario_id: item.usuario_id,
              email: item.usuario_id === user.id ? user.email || 'Sin email' : 'Sin email',
              nombre: `Miembro #${item.usuario_id.substring(0, 8)}`,
              rol: item.rol,
              activo: item.activo
            });
          }
        }
        
        setMiembros(miembrosData);
      } catch (err) {
        console.error('Error inesperado al cargar miembros:', err);
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar los miembros",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (consultorioSeleccionado) {
      cargarMiembros();
    }
  }, [consultorioSeleccionado, toast, user]);

  const handleSelectConsultorio = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setConsultorioSeleccionado(e.target.value);
  };

  // Manejadores para eventos de modales
  const handleMiembroAgregado = (nuevoMiembro: Miembro) => {
    setMiembros(prev => [...prev, nuevoMiembro]);
  };

  const handleRolActualizado = (miembroId: string, nuevoRol: string) => {
    setMiembros(prev => prev.map(m => 
      m.id === miembroId ? {...m, rol: nuevoRol} : m
    ));
  };

  const handleMiembroEliminado = (miembroId: string) => {
    setMiembros(prev => prev.filter(m => m.id !== miembroId));
  };

  if (loading && consultorios.length === 0) {
    return <MiembrosConsultorioSkeleton showSelector={true} />;
  }

  // Replace the loading text with the skeleton
  if (loading) {
    return <MiembrosConsultorioSkeleton showSelector={consultorios.length > 1} />;
  }

  if (consultorios.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p>No perteneces a ningún consultorio actualmente.</p>
        </CardContent>
      </Card>
    );
  }

  // Verificar si el usuario actual es admin del consultorio seleccionado
  const consultorioActual = consultorios.find(c => c.id === consultorioSeleccionado);
  const esAdmin = consultorioActual?.rol === 'admin';

  return (
    <div className="space-y-6">
      {consultorios.length > 1 && (
        <div className="mb-6">
          <Label htmlFor="consultorio-select">Seleccionar consultorio</Label>
          <select
            id="consultorio-select"
            value={consultorioSeleccionado}
            onChange={handleSelectConsultorio}
            className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {consultorios.map(c => (
              <option key={c.id} value={c.id}>
                {c.nombre} ({c.rol})
              </option>
            ))}
          </select>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Miembros del Consultorio</CardTitle>
              <CardDescription>
                {esAdmin ? 
                  "Gestiona los miembros de tu consultorio" : 
                  "Miembros que pertenecen a este consultorio"}
              </CardDescription>
            </div>
            {esAdmin && (
              <Button 
                onClick={() => setIsInviteDialogOpen(true)}
                className="flex items-center gap-1"
              >
                <IconUserPlus className="h-4 w-4" />
                <span>Invitar</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {miembros.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <IconUsers className="mx-auto h-10 w-10 mb-2 text-muted-foreground/50" />
              <p>No hay miembros registrados en este consultorio</p>
              {esAdmin && (
                <p className="text-sm mt-1">Haz clic en &quot;Invitar&quot; para agregar miembros</p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  {esAdmin && <TableHead className="w-[150px]">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {miembros.map(miembro => (
                  <TableRow key={miembro.id}>
                    <TableCell className="font-medium">
                      {miembro.nombre}
                      {miembro.usuario_id === user?.id && (
                        <span className="ml-1 text-sm text-muted-foreground italic">(Tú)</span>
                      )}
                    </TableCell>
                    <TableCell>{miembro.email}</TableCell>
                    <TableCell className="capitalize">{miembro.rol}</TableCell>
                    {esAdmin && (
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-blue-500"
                            onClick={() => {
                              setMiembroParaEditar(miembro);
                              setIsEditRolDialogOpen(true);
                            }}
                          >
                            <IconEdit className="h-4 w-4" />
                            <span className="sr-only">Editar rol</span>
                          </Button>
                          
                          {miembro.usuario_id !== user?.id && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-destructive"
                              onClick={() => {
                                setMiembroParaEliminar(miembro);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <IconTrash className="h-4 w-4" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modales usando los componentes separados */}
      <InvitarMiembroModal
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        consultorioId={consultorioSeleccionado}
        esAdmin={esAdmin}
        userId={user?.id || ''}
        onMiembroAgregado={handleMiembroAgregado}
      />

      <EditarRolModal
        open={isEditRolDialogOpen}
        onOpenChange={setIsEditRolDialogOpen}
        miembro={miembroParaEditar}
        esAdmin={esAdmin}
        onRolActualizado={handleRolActualizado}
      />

      <EliminarMiembroModal
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        miembro={miembroParaEliminar}
        esAdmin={esAdmin}
        usuarioActualId={user?.id || ''}
        onMiembroEliminado={handleMiembroEliminado}
      />
    </div>
  );
} 