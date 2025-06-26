"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value?: string
  onChange?: (time: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

// Generate time options in 12-hour format
const generateTimeOptions = () => {
  const times: string[] = []
  
  // Generate times from 1:00 to 12:59 in 15-minute intervals
  for (let hour = 1; hour <= 12; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour}:${minute.toString().padStart(2, '0')}`
      times.push(timeString)
    }
  }
  
  return times
}

const TIME_OPTIONS = generateTimeOptions()

// Convert 24-hour format to 12-hour format with AM/PM
const convertTo12Hour = (time24: string) => {
  if (!time24) return { time: "", period: "" }
  
  const [hours, minutes] = time24.split(':')
  const hour24 = parseInt(hours, 10)
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
  const period = hour24 >= 12 ? 'PM' : 'AM'
  
  return {
    time: `${hour12}:${minutes}`,
    period: period
  }
}

// Convert 12-hour format to 24-hour format
const convertTo24Hour = (time12: string, period: string): string => {
  if (!time12 || !period) return ""
  
  const [hourStr, minuteStr] = time12.split(':')
  let hour24 = parseInt(hourStr, 10)
  
  if (period === 'AM' && hour24 === 12) {
    hour24 = 0
  } else if (period === 'PM' && hour24 !== 12) {
    hour24 += 12
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minuteStr}`
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Selecciona hora",
  disabled = false,
  required = false,
  className
}: TimePickerProps) {
  const [isManualInput, setIsManualInput] = React.useState(false)
  const [manualValue, setManualValue] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  
  // Parse current value
  const { time, period } = convertTo12Hour(value || "")

  // Handle time change
  const handleTimeChange = (newTime: string, newPeriod: string) => {
    const time24 = convertTo24Hour(newTime, newPeriod)
    if (time24) {
      onChange?.(time24)
    }
  }

  // Handle time selection change
  const handleTimeSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleTimeChange(e.target.value, period)
  }

  // Handle period change
  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleTimeChange(time, e.target.value)
  }

  // Handle double click to switch to manual input
  const handleDoubleClick = () => {
    if (disabled) return
    setIsManualInput(true)
    setManualValue(value || "")
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
  }

  // Validate and format time input for manual mode
  const validateAndFormatTime = (timeInput: string): string => {
    const cleaned = timeInput.replace(/[^\d:]/g, '')
    const timeRegex = /^(\d{1,2}):?(\d{0,2})$/
    const match = cleaned.match(timeRegex)
    
    if (!match) return ""
    
    let hours = parseInt(match[1], 10)
    let minutes = match[2] ? parseInt(match[2], 10) : 0
    
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return ""
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  // Handle manual input
  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualValue(e.target.value)
  }

  const handleManualBlur = () => {
    const formattedTime = validateAndFormatTime(manualValue)
    if (formattedTime) {
      onChange?.(formattedTime)
    } else if (manualValue.trim() === "") {
      onChange?.("")
    }
    setIsManualInput(false)
    setManualValue("")
  }

  const handleManualKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualBlur()
    } else if (e.key === 'Escape') {
      setIsManualInput(false)
      setManualValue("")
    }
  }

  // Manual input mode
  if (isManualInput) {
    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={manualValue}
          onChange={handleManualChange}
          onBlur={handleManualBlur}
          onKeyDown={handleManualKeyPress}
          placeholder="HH:MM (ej: 14:30)"
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            "pl-10",
            className
          )}
        />
        <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>
    )
  }

  // Default mode with two selectors
  return (
    <div className={cn("relative", className)}>
      <div className="flex gap-2">
        {/* Time selector (hour:minute) */}
        <select
          value={time}
          onChange={handleTimeSelectChange}
          onDoubleClick={handleDoubleClick}
          disabled={disabled}
          required={required}
          className={cn(
            "flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            "pl-10 cursor-pointer",
            required && !value && "border-red-300 focus:border-red-500"
          )}
          title="Doble clic para escribir hora personalizada"
        >
          <option value="" disabled>
            Hora
          </option>
          {TIME_OPTIONS.map((timeOption) => (
            <option key={timeOption} value={timeOption}>
              {timeOption}
            </option>
          ))}
          {/* Show custom time if it's not in the predefined options */}
          {time && !TIME_OPTIONS.includes(time) && (
            <option key={time} value={time}>
              {time}
            </option>
          )}
        </select>

        {/* AM/PM selector */}
        <select
          value={period}
          onChange={handlePeriodChange}
          disabled={disabled}
          className={cn(
            "flex h-10 w-16 rounded-md border border-input bg-background px-2 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            "cursor-pointer text-center"
          )}
        >
          <option value="" disabled>
            --
          </option>
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
      
      <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  )
} 