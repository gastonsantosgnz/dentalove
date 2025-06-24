"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { CalendarDate, getLocalTimeZone, parseDate, today } from "@internationalized/date"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar-rac"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Selecciona fecha",
  className,
  disabled = false
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Convertir Date a CalendarDate para React Aria
  const calendarValue = React.useMemo(() => {
    if (!value) return null
    try {
      const dateString = format(value, "yyyy-MM-dd")
      return parseDate(dateString)
    } catch (error) {
      console.error("Error parsing date:", error)
      return null
    }
  }, [value])

  // Manejar cambio de fecha desde React Aria
  const handleDateChange = React.useCallback((date: CalendarDate | null) => {
    if (!date) {
      onChange(undefined)
      return
    }

    try {
      // Convertir CalendarDate a Date
      const jsDate = date.toDate(getLocalTimeZone())
      onChange(jsDate)
      setOpen(false)
    } catch (error) {
      console.error("Error converting date:", error)
    }
  }, [onChange])

  // Formatear fecha para mostrar
  const formatDate = React.useCallback((date: Date | undefined) => {
    if (!date) return placeholder
    try {
      return format(date, "PPP", { locale: es })
    } catch (error) {
      console.error("Error formatting date:", error)
      return format(date, "dd/MM/yyyy")
    }
  }, [placeholder])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDate(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[10000]" align="start">
        <Calendar
          className="rounded-lg border border-border p-2"
          value={calendarValue}
          onChange={handleDateChange}
          minValue={today(getLocalTimeZone()).subtract({ years: 10 })}
          maxValue={today(getLocalTimeZone()).add({ years: 10 })}
        />
      </PopoverContent>
    </Popover>
  )
} 