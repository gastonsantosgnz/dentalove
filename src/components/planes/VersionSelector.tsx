"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layers } from "lucide-react";

interface PlanVersion {
  id: string;
  nombre: string;
  activa: boolean;
  costo_total: number;
  plan_id: string;
  created_at: string;
}

interface VersionSelectorProps {
  versions: PlanVersion[];
  activeVersionId: string;
  onVersionChange: (versionId: string) => void;
}

export function VersionSelector({ versions, activeVersionId, onVersionChange }: VersionSelectorProps) {
  if (versions.length <= 1) {
    return null;
  }

  return (
    <div className="flex gap-4 mt-4 items-center">
      <div className="flex items-center gap-1">
        <Layers className="h-4 w-4 text-slate-500" />
        <span className="text-sm text-slate-500">{versions.length} versiones disponibles</span>
      </div>
      
      <Select value={activeVersionId} onValueChange={onVersionChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Seleccionar versión" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {versions.map(version => (
              <SelectItem key={version.id} value={version.id}>
                {version.nombre} {version.activa && "(Activa)"}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
} 