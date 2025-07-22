'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { IconEdit, IconMail, IconId, IconCalendar, IconDeviceFloppy, IconPhone, IconStethoscope, IconUser } from "@tabler/icons-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function MiCuenta() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [perfil, setPerfil] = useState({
    nombre: '',
    apellido: '',
    numero_contacto: '',
    especialidad: '',
  });

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Cargar datos del perfil
  useEffect(() => {
    const cargarPerfil = async () => {
      if (!user) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('perfiles_usuario')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Error al cargar perfil:', error);
        toast({
          title: "Error al cargar perfil",
          description: "No se pudo obtener la información de tu perfil",
          variant: "destructive"
        });
      }
      
      if (data) {
        setPerfil({
          nombre: String(data.nombre || ''),
          apellido: String(data.apellido || ''),
          numero_contacto: String(data.numero_contacto || ''),
          especialidad: String(data.especialidad || ''),
        });
      }
      
      setLoading(false);
    };
    
    cargarPerfil();
  }, [user, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPerfil(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setSaving(true);
    
    const { error } = await supabase
      .from('perfiles_usuario')
      .upsert({
        id: user.id,
        ...perfil
      });
      
    setSaving(false);
    
    if (error) {
      console.error('Error al guardar perfil:', error);
      toast({
        title: "Error al guardar cambios",
        description: "No se pudieron guardar los cambios en tu perfil",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Perfil actualizado",
        description: "Se han guardado los cambios en tu perfil"
      });
      setEditing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex justify-center">
            <p>Cargando información del perfil...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Información personal</span>
            {!editing ? (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setEditing(true)}
              >
                <IconEdit className="h-4 w-4" />
                <span>Editar</span>
              </Button>
            ) : null}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {!editing ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <IconUser className="h-4 w-4" />
                  Nombre
                </p>
                <p className="text-lg font-medium">{perfil.nombre || 'No especificado'}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <IconUser className="h-4 w-4" />
                  Apellido
                </p>
                <p className="text-lg font-medium">{perfil.apellido || 'No especificado'}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <IconPhone className="h-4 w-4" />
                  Número de contacto
                </p>
                <p className="text-lg font-medium">{perfil.numero_contacto || 'No especificado'}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <IconStethoscope className="h-4 w-4" />
                  Especialidad
                </p>
                <p className="text-lg font-medium">{perfil.especialidad || 'No especificada'}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={perfil.nombre}
                    onChange={handleInputChange}
                    placeholder="Tu nombre"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    name="apellido"
                    value={perfil.apellido}
                    onChange={handleInputChange}
                    placeholder="Tu apellido"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="numero_contacto">Número de contacto</Label>
                <Input
                  id="numero_contacto"
                  name="numero_contacto"
                  value={perfil.numero_contacto}
                  onChange={handleInputChange}
                  placeholder="Tu número de teléfono"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="especialidad">Especialidad (si eres doctor)</Label>
                <Input
                  id="especialidad"
                  name="especialidad"
                  value={perfil.especialidad}
                  onChange={handleInputChange}
                  placeholder="Ej: Odontología general, Ortodoncia, etc."
                />
              </div>
            </div>
          )}
        </CardContent>
        
        {editing && (
          <CardFooter className="flex justify-end gap-2 pt-2 border-t">
            <Button 
              variant="outline" 
              onClick={() => setEditing(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-1"
            >
              <IconDeviceFloppy className="h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </CardFooter>
        )}
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Información de la cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <IconMail className="h-4 w-4" />
                Correo electrónico
              </p>
              <p className="text-lg font-medium">{user?.email || 'No disponible'}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <IconId className="h-4 w-4" />
                ID de Usuario
              </p>
              <p className="text-lg font-medium">{user?.id?.substring(0, 8) || 'No disponible'}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <IconCalendar className="h-4 w-4" />
                Último acceso
              </p>
              <p className="text-lg font-medium">
                {formatDate(user?.last_sign_in_at || '')}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <IconCalendar className="h-4 w-4" />
                Cuenta creada
              </p>
              <p className="text-lg font-medium">
                {formatDate(user?.created_at || '')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
