"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Check, Database, Upload } from "lucide-react";
import { migrateLocalStoragePlansToSupabase } from "@/lib/migrateTreatmentPlans";
import { useRouter } from "next/navigation";

export default function MigrationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    migrated?: number;
    failed?: number;
    errors?: string[];
  } | null>(null);

  const handleMigration = async () => {
    try {
      setIsLoading(true);
      const migrationResult = await migrateLocalStoragePlansToSupabase();
      setResult(migrationResult);
    } catch (error) {
      console.error("Migration error:", error);
      setResult({
        success: false,
        migrated: 0,
        failed: 0,
        errors: [(error as Error)?.message || "Error desconocido"]
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-10">
      <Button 
        variant="outline" 
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Migración de Planes de Tratamiento</CardTitle>
          <CardDescription>
            Esta herramienta migra los planes de tratamiento almacenados en localStorage a la base de datos Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border p-4">
            <div className="flex items-center gap-3 mb-3">
              <Database className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">Migración a la base de datos</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Al hacer clic en &quot;Migrar&quot;, todos los planes de tratamiento almacenados en localStorage
              serán transferidos a Supabase. Este proceso no eliminará los datos originales.
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={handleMigration} 
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Migrando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Migrar planes
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <Check className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {result.success ? "Migración exitosa" : "Migración con errores"}
              </AlertTitle>
              <AlertDescription>
                <p>
                  Planes migrados: <strong>{result.migrated}</strong>
                  {result.failed && result.failed > 0 ? (
                    <>, Planes fallidos: <strong>{result.failed}</strong></>
                  ) : null}
                </p>
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Errores:</p>
                    <ul className="text-xs mt-1 list-disc list-inside">
                      {result.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="border-t p-6 text-xs text-muted-foreground">
          <p>
            <strong>Nota:</strong> Después de completar la migración, asegúrese de verificar que todos los datos
            se hayan transferido correctamente antes de continuar operando exclusivamente con la base de datos.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 