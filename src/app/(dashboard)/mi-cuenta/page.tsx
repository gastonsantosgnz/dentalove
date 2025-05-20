'use client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { IconEdit, IconMail, IconId, IconCalendar, IconDeviceFloppy } from "@tabler/icons-react";
import { useState } from 'react';

export default function MiCuentaPage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [nombre, setNombre] = useState('');
  
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

  return (
    <div className="container px-4 py-8 md:py-12 flex flex-col items-center min-h-[calc(100vh-80px)]">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-8 text-center"
      >
        Mi Cuenta
      </motion.h1>
      <div className="w-full max-w-[800px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Información de perfil</span>
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
            
            <CardContent className="space-y-4">
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

              {editing && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="text-lg font-medium mb-4">Actualizar información</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
                        placeholder="Tu nombre completo"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            
            {editing && (
              <CardFooter className="flex justify-end gap-2 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditing(false);
                    setNombre('');
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-1"
                >
                  <IconDeviceFloppy className="h-4 w-4" />
                  Guardar cambios
                </Button>
              </CardFooter>
            )}
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de cuenta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                <p>No hay preferencias disponibles actualmente</p>
                <p className="text-sm mt-1">Las opciones de configuración se implementarán en futuras actualizaciones</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 