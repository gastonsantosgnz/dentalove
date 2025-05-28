'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

interface InvitarMiembroModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultorioId: string;
  esAdmin: boolean;
  userId: string;
  onMiembroAgregado: (miembro: any) => void;
}

export function InvitarMiembroModal({
  open,
  onOpenChange,
  consultorioId,
  esAdmin,
  userId,
  onMiembroAgregado
}: InvitarMiembroModalProps) {
  const { toast } = useToast();
  const [invitacion, setInvitacion] = useState({
    email: '',
    rol: 'doctor'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!consultorioId || !invitacion.email || !invitacion.rol) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }
    
    if (!esAdmin) {
      toast({
        title: "Acceso denegado",
        description: "Solo administradores pueden invitar miembros",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Buscar si el usuario ya existe en la plataforma
      const { data: usuarios, error: usuariosError } = await supabase.auth.admin.listUsers();
      
      if (usuariosError) {
        console.error('Error al buscar usuarios:', usuariosError);
        toast({
          title: "Error",
          description: "Error al procesar la invitación",
          variant: "destructive"
        });
        return;
      }
      
      // Buscar el usuario por email
      const usuarioExistente = usuarios?.users?.find(u => u.email === invitacion.email);
      
      // TODO: Implementar envío de email de invitación si el usuario no existe
      if (!usuarioExistente) {
        toast({
          title: "Usuario no encontrado",
          description: "El correo electrónico no está registrado en la plataforma. Se enviará una invitación por email (funcionalidad pendiente).",
        });
        onOpenChange(false);
        return;
      }
      
      // Verificar si el usuario ya es miembro del consultorio
      const { data: miembroExistente } = await supabase
        .from('usuarios_consultorios')
        .select('id')
        .eq('consultorio_id', consultorioId)
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
          consultorio_id: consultorioId,
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
        return;
      }
      
      // Obtener el perfil del usuario
      const { data: perfilData } = await supabase
        .from('perfiles_usuario')
        .select('id, nombre, apellido, email')
        .eq('id', usuarioExistente.id)
        .single();
        
      let nombre = usuarioExistente.email;
      let emailGuardado = false;
      
      // Si existe el perfil
      if (perfilData) {
        if (perfilData.nombre || perfilData.apellido) {
          nombre = `${perfilData.nombre || ''} ${perfilData.apellido || ''}`.trim();
        }
        
        // Verificar si ya tiene un email registrado
        if (!perfilData.email) {
          // Actualizar el email en el perfil
          const { error: updateError } = await supabase
            .from('perfiles_usuario')
            .update({ email: usuarioExistente.email })
            .eq('id', usuarioExistente.id);
            
          if (!updateError) {
            emailGuardado = true;
          } else {
            console.warn('No se pudo actualizar el email en el perfil', updateError);
          }
        } else {
          emailGuardado = true;
        }
      } else {
        // Crear perfil si no existe
        const { error: createError } = await supabase
          .from('perfiles_usuario')
          .insert({
            id: usuarioExistente.id,
            email: usuarioExistente.email,
            nombre: usuarioExistente.user_metadata?.nombre || '',
            apellido: usuarioExistente.user_metadata?.apellido || ''
          });
          
        if (!createError) {
          emailGuardado = true;
        } else {
          console.warn('No se pudo crear el perfil de usuario', createError);
        }
      }
      
      toast({
        title: "Miembro agregado",
        description: "Se ha agregado al miembro al consultorio exitosamente" + 
          (!emailGuardado ? ". No se pudo guardar su email en el perfil." : "")
      });
      
      // Crear objeto del nuevo miembro
      const nuevoMiembro = {
        id: Date.now().toString(), // Temporal hasta recargar
        usuario_id: usuarioExistente.id,
        email: emailGuardado ? usuarioExistente.email : 'Sin email',
        nombre: nombre || usuarioExistente.email,
        rol: invitacion.rol,
        activo: true
      };
      
      // Notificar al componente padre
      onMiembroAgregado(nuevoMiembro);
      
      // Cerrar modal y resetear form
      onOpenChange(false);
      setInvitacion({ email: '', rol: 'doctor' });
      
    } catch (error) {
      console.error('Error general al invitar:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar la invitación",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden">
        <DialogHeader>
          <DialogTitle>Invitar miembro al consultorio</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={invitacion.email}
              onChange={handleInputChange}
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
              <SelectContent position="popper" className="z-[200]">
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
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Invitar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 