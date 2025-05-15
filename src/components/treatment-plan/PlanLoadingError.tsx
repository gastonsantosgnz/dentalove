import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PlanLoadingProps {
  isLoading: boolean;
}

interface PlanErrorProps {
  error: string | null;
  pacienteId: string;
  onBack: () => void;
}

export function PlanLoading({ isLoading }: PlanLoadingProps) {
  if (!isLoading) return null;
  
  return (
    <div className="container max-w-6xl mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-slate-200 rounded-md animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 rounded-md animate-pulse"></div>
          <div className="h-5 w-72 bg-slate-200 rounded-md animate-pulse"></div>
        </div>
      </div>
      
      <div className="flex gap-4 mt-4 items-center">
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 bg-slate-200 rounded-full animate-pulse"></div>
          <div className="h-4 w-36 bg-slate-200 rounded-md animate-pulse"></div>
        </div>
        <div className="h-10 w-[180px] bg-slate-200 rounded-md animate-pulse"></div>
      </div>
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mt-6">
        <Card className="w-full md:w-2/3 animate-pulse">
          <CardHeader className="pb-2">
            <div className="h-6 w-36 bg-slate-200 rounded-md mb-2"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-5 w-32 bg-slate-200 rounded-md"></div>
              <div className="h-5 w-24 bg-slate-200 rounded-md"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-5 w-40 bg-slate-200 rounded-md"></div>
              <div className="h-5 w-16 bg-slate-200 rounded-md"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-5 w-28 bg-slate-200 rounded-md"></div>
              <div className="h-5 w-20 bg-slate-200 rounded-md"></div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-slate-200 rounded-md animate-pulse"></div>
          <div className="h-10 w-36 bg-slate-200 rounded-md animate-pulse"></div>
          <div className="h-10 w-28 bg-slate-200 rounded-md animate-pulse"></div>
        </div>
      </div>

      <Tabs defaultValue="skeleton" className="w-full mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="skeleton" className="pointer-events-none">
            <div className="h-4 w-20 bg-slate-200 rounded-md animate-pulse"></div>
          </TabsTrigger>
          <TabsTrigger value="skeleton2" className="pointer-events-none">
            <div className="h-4 w-20 bg-slate-200 rounded-md animate-pulse"></div>
          </TabsTrigger>
          <TabsTrigger value="skeleton3" className="pointer-events-none">
            <div className="h-4 w-20 bg-slate-200 rounded-md animate-pulse"></div>
          </TabsTrigger>
        </TabsList>
        
        <div className="space-y-4 border p-4 rounded-md">
          <div className="h-6 w-48 bg-slate-200 rounded-md animate-pulse"></div>
          
          <div className="space-y-6">
            <div className="rounded-md border">
              <div className="p-3 border-b bg-slate-50">
                <div className="h-5 w-36 bg-slate-200 rounded-md animate-pulse"></div>
              </div>
              <div className="p-4">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      {[1, 2, 3, 4].map((i) => (
                        <th key={i} className="p-2">
                          <div className="h-4 w-full bg-slate-200 rounded-md animate-pulse"></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((row) => (
                      <tr key={row} className="border-b">
                        {[1, 2, 3, 4].map((col) => (
                          <td key={col} className="p-2">
                            <div className="h-4 w-full bg-slate-200 rounded-md animate-pulse"></div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="rounded-md border">
              <div className="p-3 border-b bg-slate-50">
                <div className="h-5 w-36 bg-slate-200 rounded-md animate-pulse"></div>
              </div>
              <div className="p-4">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <th key={i} className="p-2">
                          <div className="h-4 w-full bg-slate-200 rounded-md animate-pulse"></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4].map((row) => (
                      <tr key={row} className="border-b">
                        {[1, 2, 3, 4, 5].map((col) => (
                          <td key={col} className="p-2">
                            <div className="h-4 w-full bg-slate-200 rounded-md animate-pulse"></div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
}

export function PlanError({ error, pacienteId, onBack }: PlanErrorProps) {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="my-8">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {error || "No se pudo cargar el plan de tratamiento. El plan puede no existir."}
      </AlertDescription>
      <div className="mt-4">
        <Button variant="outline" onClick={onBack}>
          Volver a la lista de planes
        </Button>
      </div>
    </Alert>
  );
} 