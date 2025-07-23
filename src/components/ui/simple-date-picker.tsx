"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SimpleDatePickerProps {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  disablePastDates?: boolean;
  disableFutureDates?: boolean;
}

export function SimpleDatePicker({
  date,
  onSelect,
  placeholder = "Selecciona fecha",
  className,
  disabled = false,
  disablePastDates = false,
  disableFutureDates = false,
}: SimpleDatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    onSelect(selectedDate);
    setOpen(false);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return placeholder;
    return format(date, "PPP", { locale: es });
  };

  const getDisabledDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (disablePastDates && disableFutureDates) {
      // Solo permitir hoy
      return (date: Date) => {
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        return compareDate.getTime() !== today.getTime();
      };
    } else if (disablePastDates) {
      // Deshabilitar fechas pasadas
      return (date: Date) => {
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        return compareDate < today;
      };
    } else if (disableFutureDates) {
      // Deshabilitar fechas futuras
      return (date: Date) => {
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        return compareDate > today;
      };
    }
    return undefined;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDate(date)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[9999]" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          disabled={getDisabledDates()}
          initialFocus
          className="rounded-lg border border-border p-2"
        />
      </PopoverContent>
    </Popover>
  );
} 