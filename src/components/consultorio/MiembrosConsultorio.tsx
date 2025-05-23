'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPlus, IconUserPlus, IconUsers, IconX, IconCheck, IconTrash } from "@tabler/icons-react";
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

export function MiembrosConsultorio() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [consultorioSeleccionado, setConsultorioSeleccionado] = useState<string>('');
  const [consultorios, setConsultorios] = useState<{ id: string, nombre: string, rol: string }[]>([]);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditRolDialogOpen, setIsEditRolDialogOpen] = useState(false);
  const [miembroParaEliminar, setMiembroParaEliminar] = useState<Miembro | null>(null);
  const [miembroParaEditar, setMiembroParaEditar] = useState<Miembro | null>(null);
  const [nuevoRol, setNuevoRol] = useState('');
  
  // Estado para el formulario de invitación
  const [invitacion, setInvitacion] = useState({
    email: '',
    rol: 'doctor'
  });

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
        
        for (const item of data) {
          try {
            let nombre = 'Usuario';
            let email = 'Sin email';
            
            // Intentar obtener perfil del usuario
            try {
              const { data: perfilData } = await supabase
                .from('perfiles_usuario')
                .select('nombre, apellido')
                .eq('id', item.usuario_id)
                .single();
                
              if (perfilData) {
                nombre = `${perfilData.nombre || ''} ${perfilData.apellido || ''}`.trim();
                if (nombre === '') nombre = 'Usuario sin nombre';
              }
            } catch (perfilError) {
              console.warn(`No se pudo obtener perfil para ${item.usuario_id}`);
              // Continuamos aunque no tengamos el perfil
            }
            
            // Intentar obtener email del usuario
            try {
              const { data: authUser } = await supabase.auth.getUser(item.usuario_id);
              if (authUser && authUser.user) {
                email = authUser.user.email || 'Sin email';
              }
            } catch (authError) {
              console.warn(`No se pudo obtener email para ${item.usuario_id}`);
              // Continuamos aunque no tengamos el email
            }
            
            // Si no se pudo obtener el nombre ni el email, usar un identificador genérico
            if (nombre === 'Usuario sin nombre' && email === 'Sin email') {
              nombre = `Miembro #${item.usuario_id.substring(0, 8)}`;
            }
            
            // Si es el usuario actual, asegurar que se muestre
            if (item.usuario_id === user.id) {
              if (email === 'Sin email') {
                email = user.email || 'Sin email';
              }
              if (nombre === 'Usuario sin nombre') {
                nombre = `Usuario (${user.email || 'Tú'})`;
              }
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
              email: 'Sin email',
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

  const handleInviteInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInvitacion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRolChange = (value: string) => {
    setInvitacion(prev => ({
      ...prev,
      rol: value
    }));
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!consultorioSeleccionado || !invitacion.email || !invitacion.rol) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }
    
    // Verificar si el usuario actual es admin del consultorio
    const userConsultorio = consultorios.find(c => c.id === consultorioSeleccionado);
    if (userConsultorio?.rol !== 'admin') {
      toast({
        title: "Acceso denegado",
        description: "Solo administradores pueden invitar miembros",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Buscar si el usuario ya existe en la plataforma usando la API de auth
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error al buscar usuarios:', authError);
        toast({
          title: "Error",
          description: "Error al procesar la invitación",
          variant: "destructive"
        });
        return;
      }
      
      // Buscar el usuario por email
      const usuarioExistente = authData?.users?.find(u => u.email === invitacion.email);
      
      // TODO: Implementar envío de email de invitación si el usuario no existe
      if (!usuarioExistente) {
        toast({
          title: "Usuario no encontrado",
          description: "El correo electrónico no está registrado en la plataforma. Se enviará una invitación por email (funcionalidad pendiente).",
        });
        setIsInviteDialogOpen(false);
        return;
      }
      
      // Verificar si el usuario ya es miembro del consultorio
      const { data: miembroExistente } = await supabase
        .from('usuarios_consultorios')
        .select('id')
        .eq('consultorio_id', consultorioSeleccionado)
        .eq('usuario_id', usuarioExistente.id);
      
      if (miembroExistente && miembroExistente.length > 0) {
        toast({
          title: "Usuario ya es miembro",
          description: "Este usuario ya es miembro del consultorio",
          variant: "destructive"
        });
        return;
      }
      
      // Agregar usuario al consultorio
      const { error } = await supabase
        .from('usuarios_consultorios')
        .insert({
          usuario_id: usuarioExistente.id,
          consultorio_id: consultorioSeleccionado,
          rol: invitacion.rol,
          activo: true
        });
      
      if (error) {
        console.error('Error al agregar miembro:', error);
        toast({
          title: "Error",
          description: "No se pudo agregar al miembro al consultorio",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Miembro agregado",
          description: "Se ha agregado al miembro al consultorio exitosamente"
        });
        
        // Recargar miembros
        setIsInviteDialogOpen(false);
        setInvitacion({ email: '', rol: 'doctor' });
        
        // Agregar el nuevo miembro a la lista
        setMiembros(prev => [
          ...prev,
          {
            id: Date.now().toString(), // Temporal hasta recargar
            usuario_id: usuarioExistente.id,
            email: usuarioExistente.email || invitacion.email,
            nombre: usuarioExistente.user_metadata?.nombre || usuarioExistente.email || invitacion.email,
            rol: invitacion.rol,
            activo: true
          }
        ]);
      }
    } catch (error) {
      console.error('Error general al invitar:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar la invitación",
        variant: "destructive"
      });
    }
  };

  // Función para actualizar el rol de un miembro
  const handleEditRol = async () => {
    if (!miembroParaEditar || !nuevoRol) return;
    
    // Verificar si el usuario actual es admin
    const userConsultorio = consultorios.find(c => c.id === consultorioSeleccionado);
    if (userConsultorio?.rol !== 'admin') {
      toast({
        title: "Acceso denegado",
        description: "Solo administradores pueden cambiar roles",
        variant: "destructive"
      });
      setIsEditRolDialogOpen(false);
      return;
    }
    
    const { error } = await supabase
      .from('usuarios_consultorios')
      .update({ rol: nuevoRol })
      .eq('id', miembroParaEditar.id);
    
    if (error) {
      console.error('Error al actualizar rol:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol del miembro",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Rol actualizado",
        description: "Se ha actualizado el rol del miembro exitosamente"
      });
      
      // Actualizar lista de miembros
      setMiembros(prev => prev.map(m => 
        m.id === miembroParaEditar.id ? {...m, rol: nuevoRol} : m
      ));
    }
    
    setIsEditRolDialogOpen(false);
    setMiembroParaEditar(null);
    setNuevoRol('');
  };

  const handleDeleteMember = async () => {
    if (!miembroParaEliminar) return;
    
    // Verificar si el usuario actual es admin
    const userConsultorio = consultorios.find(c => c.id === consultorioSeleccionado);
    if (userConsultorio?.rol !== 'admin') {
      toast({
        title: "Acceso denegado",
        description: "Solo administradores pueden eliminar miembros",
        variant: "destructive"
      });
      setIsDeleteDialogOpen(false);
      return;
    }
    
    // No permitir eliminar al propio usuario
    if (miembroParaEliminar.usuario_id === user?.id) {
      toast({
        title: "Acción no permitida",
        description: "No puedes eliminarte a ti mismo del consultorio",
        variant: "destructive"
      });
      setIsDeleteDialogOpen(false);
      return;
    }
    
    const { error } = await supabase
      .from('usuarios_consultorios')
      .delete()
      .eq('id', miembroParaEliminar.id);
    
    if (error) {
      console.error('Error al eliminar miembro:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar al miembro del consultorio",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Miembro eliminado",
        description: "Se ha eliminado al miembro del consultorio exitosamente"
      });
      
      // Actualizar lista de miembros
      setMiembros(prev => prev.filter(m => m.id !== miembroParaEliminar.id));
    }
    
    setIsDeleteDialogOpen(false);
    setMiembroParaEliminar(null);
  };

  if (loading && consultorios.length === 0) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex justify-center">
            <p>Cargando información...</p>
          </div>
        </CardContent>
      </Card>
    );
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
                              setNuevoRol(miembro.rol);
                              setIsEditRolDialogOpen(true);
                            }}
                          >
                            <IconUserPlus className="h-4 w-4" />
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

      {/* Diálogo para invitar miembros */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitar miembro al consultorio</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleInviteSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={invitacion.email}
                onChange={handleInviteInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rol">Rol en el consultorio</Label>
              <Select 
                value={invitacion.rol} 
                onValueChange={handleRolChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="asistente">Asistente</SelectItem>
                  <SelectItem value="recepcionista">Recepcionista</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsInviteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Invitar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar rol */}
      <Dialog open={isEditRolDialogOpen} onOpenChange={setIsEditRolDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar rol de miembro</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-medium">
                Miembro: <span className="font-bold">{miembroParaEditar?.nombre}</span>
              </p>
              <p className="text-sm text-muted-foreground">{miembroParaEditar?.email}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rol">Nuevo rol</Label>
              <Select 
                value={nuevoRol} 
                onValueChange={setNuevoRol}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="asistente">Asistente</SelectItem>
                  <SelectItem value="recepcionista">Recepcionista</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditRolDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleEditRol}>Guardar cambios</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo para eliminar miembro */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar miembro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción removerá a {miembroParaEliminar?.nombre} ({miembroParaEliminar?.email}) del consultorio.
              No podrá acceder más a la información de este consultorio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMember}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 