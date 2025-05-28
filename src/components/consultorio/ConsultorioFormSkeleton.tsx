import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ConsultorioFormSkeleton({ showSelector = false }: { showSelector?: boolean }) {
  return (
    <div className="space-y-6">
      {/* Header con título y botón crear */}
      <div className="flex justify-between items-center">
        <div className="h-7 w-40 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-9 w-36 bg-gray-200 animate-pulse rounded"></div>
      </div>
      
      {/* Selector de consultorio */}
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
              <div className="h-6 w-64 bg-gray-200 animate-pulse rounded mb-2"></div>
              <div className="h-4 w-80 bg-gray-200 animate-pulse rounded"></div>
            </div>
            <div className="h-9 w-24 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="h-5 w-48 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-7 w-full bg-gray-200 animate-pulse rounded"></div>
            </div>
            
            <div className="space-y-3">
              <div className="h-5 w-32 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-7 w-full bg-gray-200 animate-pulse rounded"></div>
            </div>
            
            <div className="space-y-3 md:col-span-2">
              <div className="h-5 w-32 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-20 w-full bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 