'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { IconEdit, IconDeviceFloppy, IconBuilding, IconPhone, IconMap, IconPlus } from "@tabler/icons-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

interface Consultorio {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  logo: string;
  rol?: string;
}

export function ConsultorioForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [consultorioSeleccionado, setConsultorioSeleccionado] = useState<string>('');
  const [consultorios, setConsultorios] = useState<Consultorio[]>([]);
  
  const [formData, setFormData] = useState<Omit<Consultorio, 'id'>>({
    nombre: '',
    direccion: '',
    telefono: '',
    logo: '',
  });

  const [nuevoConsultorio, setNuevoConsultorio] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    logo: '',
  });

  // Cargar consultorios del usuario
  useEffect(() => {
    const cargarConsultorios = async () => {
      if (!user) return;
      
      setLoading(true);
      
      // Consultar consultorios a los que pertenece el usuario
      const { data, error } = await supabase
        .from('usuarios_consultorios')
        .select(`
          consultorio_id,
          rol,
          consultorios:consultorio_id(
            id, 
            nombre, 
            direccion, 
            telefono, 
            logo
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
        setLoading(false);
        return;
      }
      
      // Transformar datos para facilitar su uso
      const consultoriosData = data.map(item => {
        return {
          id: item.consultorio_id,
          nombre: item.consultorios ? (item.consultorios as any).nombre || '' : '',
          direccion: item.consultorios ? (item.consultorios as any).direccion || '' : '',
          telefono: item.consultorios ? (item.consultorios as any).telefono || '' : '',
          logo: item.consultorios ? (item.consultorios as any).logo || '' : '',
          rol: item.rol
        };
      });
      
      setConsultorios(consultoriosData);
      
      // Seleccionar el primer consultorio por defecto
      if (consultoriosData.length > 0 && !consultorioSeleccionado) {
        setConsultorioSeleccionado(consultoriosData[0].id);
        setFormData({
          nombre: consultoriosData[0].nombre,
          direccion: consultoriosData[0].direccion,
          telefono: consultoriosData[0].telefono,
          logo: consultoriosData[0].logo,
        });
      }
      
      setLoading(false);
    };
    
    cargarConsultorios();
  }, [user, toast, consultorioSeleccionado]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const consultorioId = e.target.value;
    setConsultorioSeleccionado(consultorioId);
    
    // Actualizar form data con el consultorio seleccionado
    const consultorio = consultorios.find(c => c.id === consultorioId);
    if (consultorio) {
      setFormData({
        nombre: consultorio.nombre,
        direccion: consultorio.direccion,
        telefono: consultorio.telefono,
        logo: consultorio.logo,
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNuevoConsultorioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNuevoConsultorio(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!user || !consultorioSeleccionado) return;
    
    setSaving(true);
    
    // Verificar si el usuario tiene permisos para editar (solo admin)
    const userConsultorio = consultorios.find(c => c.id === consultorioSeleccionado);
    if (userConsultorio?.rol !== 'admin') {
      toast({
        title: "Acceso denegado",
        description: "Solo administradores pueden editar la información del consultorio",
        variant: "destructive"
      });
      setSaving(false);
      return;
    }
    
    const { error } = await supabase
      .from('consultorios')
      .update({
        nombre: formData.nombre,
        direccion: formData.direccion,
        telefono: formData.telefono,
        logo: formData.logo,
        updated_at: new Date().toISOString()
      })
      .eq('id', consultorioSeleccionado);
      
    setSaving(false);
    
    if (error) {
      console.error('Error al guardar consultorio:', error);
      toast({
        title: "Error al guardar cambios",
        description: "No se pudieron guardar los cambios en el consultorio",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Consultorio actualizado",
        description: "Se han guardado los cambios en el consultorio"
      });
      setEditing(false);
      
      // Actualizar lista de consultorios
      const consultoriosActualizados = consultorios.map(c => {
        if (c.id === consultorioSeleccionado) {
          return { ...c, ...formData };
        }
        return c;
      });
      
      setConsultorios(consultoriosActualizados);
    }
  };

  const crearConsultorio = async () => {
    if (!user) return;
    
    setCreating(true);
    
    try {
      // Insertar nuevo consultorio
      const { data: consultorioData, error: consultorioError } = await supabase
        .from('consultorios')
        .insert({
          nombre: nuevoConsultorio.nombre,
          direccion: nuevoConsultorio.direccion,
          telefono: nuevoConsultorio.telefono,
          logo: nuevoConsultorio.logo,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();
        
      if (consultorioError) throw consultorioError;
      
      // Asociar usuario al consultorio como administrador
      const { error: usuarioConsultorioError } = await supabase
        .from('usuarios_consultorios')
        .insert({
          usuario_id: user.id,
          consultorio_id: consultorioData.id,
          rol: 'admin',
          activo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (usuarioConsultorioError) throw usuarioConsultorioError;
      
      // Actualizar la UI
      const nuevoConsultorioCompleto: Consultorio = {
        id: consultorioData.id,
        nombre: nuevoConsultorio.nombre,
        direccion: nuevoConsultorio.direccion,
        telefono: nuevoConsultorio.telefono,
        logo: nuevoConsultorio.logo,
        rol: 'admin'
      };
      
      setConsultorios([...consultorios, nuevoConsultorioCompleto]);
      setConsultorioSeleccionado(consultorioData.id);
      setFormData({
        nombre: nuevoConsultorio.nombre,
        direccion: nuevoConsultorio.direccion,
        telefono: nuevoConsultorio.telefono,
        logo: nuevoConsultorio.logo,
      });
      
      // Limpiar y cerrar modal
      setNuevoConsultorio({
        nombre: '',
        direccion: '',
        telefono: '',
        logo: '',
      });
      setModalOpen(false);
      
      toast({
        title: "Consultorio creado",
        description: "Se ha creado el consultorio correctamente"
      });
    } catch (error) {
      console.error('Error al crear consultorio:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el consultorio",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const renderConsultorioForm = () => {
    // Encontrar el consultorio seleccionado para verificar el rol
    const consultorioActual = consultorios.find(c => c.id === consultorioSeleccionado);
    const esAdmin = consultorioActual?.rol === 'admin';

    return (
      <>
        {consultorios.length > 1 && (
          <div className="mb-6">
            <Label htmlFor="consultorio">Seleccionar consultorio</Label>
            <select
              id="consultorio"
              value={consultorioSeleccionado}
              onChange={handleSelectChange}
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
            <CardTitle className="flex items-center justify-between">
              <span>Información del Consultorio</span>
              {!editing && esAdmin ? (
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
            <CardDescription>
              {esAdmin 
                ? "Como administrador puedes editar la información del consultorio" 
                : "Solo los administradores pueden editar la información del consultorio"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!editing ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <IconBuilding className="h-4 w-4" />
                    Nombre del consultorio
                  </p>
                  <p className="text-lg font-medium">{formData.nombre || 'No especificado'}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <IconPhone className="h-4 w-4" />
                    Teléfono
                  </p>
                  <p className="text-lg font-medium">{formData.telefono || 'No especificado'}</p>
                </div>
                
                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <IconMap className="h-4 w-4" />
                    Dirección
                  </p>
                  <p className="text-lg font-medium">{formData.direccion || 'No especificada'}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del consultorio</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Nombre del consultorio"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="Teléfono de contacto"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Textarea
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    placeholder="Dirección física del consultorio"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logo">URL del logo (imagen cuadrada 1:1)</Label>
                  <Input
                    id="logo"
                    name="logo"
                    value={formData.logo}
                    onChange={handleInputChange}
                    placeholder="URL de la imagen del logo (formato cuadrado)"
                  />
                  <p className="text-sm text-muted-foreground">La imagen debe tener formato cuadrado (ratio 1:1) para una visualización óptima.</p>
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
      </>
    );
  };

  const renderDialogContent = () => (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Crear nuevo consultorio</DialogTitle>
        <DialogDescription>
          Completa la información para crear un nuevo consultorio. Serás asignado como administrador automáticamente.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="nuevo-nombre">Nombre del consultorio *</Label>
          <Input
            id="nuevo-nombre"
            name="nombre"
            value={nuevoConsultorio.nombre}
            onChange={handleNuevoConsultorioChange}
            placeholder="Nombre del consultorio"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="nuevo-telefono">Teléfono</Label>
          <Input
            id="nuevo-telefono"
            name="telefono"
            value={nuevoConsultorio.telefono}
            onChange={handleNuevoConsultorioChange}
            placeholder="Teléfono de contacto"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="nuevo-direccion">Dirección</Label>
          <Textarea
            id="nuevo-direccion"
            name="direccion"
            value={nuevoConsultorio.direccion}
            onChange={handleNuevoConsultorioChange}
            placeholder="Dirección física del consultorio"
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="nuevo-logo">URL del logo (imagen cuadrada 1:1)</Label>
          <Input
            id="nuevo-logo"
            name="logo"
            value={nuevoConsultorio.logo}
            onChange={handleNuevoConsultorioChange}
            placeholder="URL de la imagen del logo (formato cuadrado)"
          />
          <p className="text-sm text-muted-foreground">La imagen debe tener formato cuadrado (ratio 1:1) para una visualización óptima.</p>
        </div>
      </div>
      <DialogFooter>
        <Button 
          variant="outline" 
          onClick={() => setModalOpen(false)}
        >
          Cancelar
        </Button>
        <Button 
          onClick={crearConsultorio}
          disabled={creating || !nuevoConsultorio.nombre}
        >
          {creating ? 'Creando...' : 'Crear consultorio'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex justify-center">
            <p>Cargando información del consultorio...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (consultorios.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Mis consultorios</h2>
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={() => setModalOpen(true)}
          >
            <IconPlus className="h-4 w-4" />
            Crear consultorio
          </Button>
        </div>
        
        <Card>
          <CardContent className="py-10 text-center">
            <p className="mb-4">No perteneces a ningún consultorio actualmente.</p>
          </CardContent>
        </Card>
        
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          {renderDialogContent()}
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Mis consultorios</h2>
        <Button 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={() => setModalOpen(true)}
        >
          <IconPlus className="h-4 w-4" />
          Crear consultorio
        </Button>
      </div>
      
      {renderConsultorioForm()}
      
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        {renderDialogContent()}
      </Dialog>
    </div>
  );
} 