"use client"

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlusCircle, Trash2 } from "lucide-react";
import { PlanVersion } from "./types";

interface PlanVersionManagerProps {
  planVersions: PlanVersion[];
  activeVersion: PlanVersion;
  toothStatus: Record<string, any[]>;
  customCosts: Record<string, number>;
  setCustomCosts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  handleCreateVersion: () => void;
  handleDeleteVersion: (versionId: string) => void;
  handleChangeVersion: (versionId: string) => void;
}

export function PlanVersionManager({
  planVersions,
  activeVersion,
  toothStatus,
  customCosts,
  setCustomCosts,
  handleCreateVersion,
  handleDeleteVersion,
  handleChangeVersion
}: PlanVersionManagerProps) {
  return (
    <>
      <div className="px-4 py-2 border-b flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm"
          className="h-7"
          onClick={handleCreateVersion}
        >
          <PlusCircle className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">Nueva versión</span>
        </Button>
        
        {planVersions.length > 1 && (
          <Button 
            variant="outline" 
            size="sm"
            className="h-7 text-red-500 hover:text-red-600"
            onClick={() => handleDeleteVersion(activeVersion.id)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Eliminar</span>
          </Button>
        )}
      </div>
      
      {/* Selector de versiones si hay más de una */}
      {planVersions.length > 1 && (
        <div className="px-4 py-2 border-b flex flex-wrap gap-2">
          <div className="flex w-full flex-wrap gap-1">
            {planVersions.map((version) => (
              <Button 
                key={version.id}
                variant={version.isActive ? "default" : "outline"}
                size="sm"
                className={cn("h-7 flex-1 min-w-0",
                  version.isActive && "bg-slate-800 text-white hover:bg-slate-700"
                )}
                onClick={() => handleChangeVersion(version.id)}
              >
                <span className="text-xs truncate">{version.nombre}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </>
  );
} 