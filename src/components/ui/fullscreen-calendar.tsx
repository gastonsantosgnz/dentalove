"use client"

import * as React from "react"
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfToday,
  startOfWeek,
  addDays,
} from "date-fns"
import { es } from "date-fns/locale"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
  CalendarIcon,
  Clock,
  ChevronDown,
  Users,
  Star
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"

// Tipo de visualización del calendario
type CalendarView = "week" | "twoWeeks" | "month"

interface Event {
  id: number | string
  name: string
  time: string
  datetime: string
  patient?: string
  doctor?: string
  service?: string
  is_first_visit?: boolean
}

interface CalendarData {
  day: Date
  events: Event[]
}

interface Doctor {
  id: string
  nombre_completo: string
}

interface FullScreenCalendarProps {
  data: CalendarData[]
  onAddEvent?: () => void
  onEventClick?: (event: Event) => void
  onDayDoubleClick?: (date: Date, time?: string) => void
  doctors?: Doctor[]
  selectedDoctorIds?: string[]
  onDoctorFilterChange?: (doctorIds: string[]) => void
  workingHours?: Record<number, string[]>
}

const colStartClasses = [
  "col-start-7", // Domingo en última posición (posición 7)
  "col-start-1", // Lunes en primera posición (posición 1)
  "col-start-2", // Martes
  "col-start-3", // Miércoles
  "col-start-4", // Jueves
  "col-start-5", // Viernes
  "col-start-6", // Sábado
]

// Hook simple para detectar desktop sin problemas de hidratación
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    setIsDesktop(window.innerWidth >= 768)
  }, [])

  React.useEffect(() => {
    if (!mounted) return

    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    
    window.addEventListener('resize', handleResize, { passive: true })
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [mounted])

  return mounted ? isDesktop : false
}

// Week View with Time Slots Component
interface WeekViewWithTimeSlotsProps {
  days: Date[]
  data: CalendarData[]
  workingHours: Record<number, string[]>
  selectedDay: Date
  currentDate: Date
  onEventClick?: (event: Event) => void
  onDayClick: (day: Date) => void
  onDayDoubleClick: (day: Date, time?: string) => void
}

const WeekViewWithTimeSlots = React.memo(function WeekViewWithTimeSlots({
  days,
  data,
  workingHours,
  selectedDay,
  currentDate,
  onEventClick,
  onDayClick,
  onDayDoubleClick
}: WeekViewWithTimeSlotsProps) {
  // Get all unique time slots from working hours
  const allTimeSlots = React.useMemo(() => {
    const slots = new Set<string>()
    Object.values(workingHours).forEach(hours => {
      hours.forEach(hour => slots.add(hour))
    })
    return Array.from(slots).sort()
  }, [workingHours])

  return (
    <div className="hidden h-full lg:block overflow-auto">
      <div className="grid grid-cols-8 border-x min-h-full">
        {/* Time column */}
        <div className="border-r bg-muted/30">
          {allTimeSlots.map((timeSlot) => (
            <div 
              key={timeSlot}
              className="h-20 border-b flex items-center justify-center text-xs text-muted-foreground px-2 font-medium"
            >
              {timeSlot}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day, dayIdx) => {
          const dayOfWeek = getDay(day)
          const dayWorkingHours = workingHours[dayOfWeek] || []
          const dayEvents = data.find(d => isSameDay(d.day, day))?.events || []

          return (
            <div 
              key={`${format(day, 'yyyy-MM-dd')}-${dayIdx}`}
              className={cn(
                "border-r relative",
                !isSameMonth(day, currentDate) && "bg-accent/50",
                isEqual(day, selectedDay) && !isToday(day) && "bg-accent/75",
                dayWorkingHours.length === 0 && "bg-muted/50"
              )}
            >
              

              {/* Time slots */}
              {allTimeSlots.map((timeSlot) => {
                const isWorkingHour = dayWorkingHours.includes(timeSlot)
                const slotEvents = dayEvents.filter(event => event.time === timeSlot)

                return (
                                    <div
                    key={timeSlot}
                    className={cn(
                      "h-20 border-b relative",
                      !isWorkingHour && "bg-muted/30",
                      isWorkingHour && "cursor-pointer hover:bg-muted/20 transition-colors"
                    )}
                    onClick={() => isWorkingHour && onDayClick(day)}
                    onDoubleClick={() => isWorkingHour && onDayDoubleClick(day, timeSlot)}
                    title={isWorkingHour ? "Haz doble clic para agendar una nueva cita" : "Fuera del horario laboral"}
                  >
                    {/* Events in this time slot */}
                    {slotEvents.map((event, eventIdx) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventClick?.(event)
                        }}
                        className={cn(
                          "absolute inset-x-1 top-1 bottom-1 rounded-md border p-1 text-xs cursor-pointer transition-all duration-200 hover:shadow-sm hover:z-10",
                          event.is_first_visit 
                            ? "bg-blue-50 border-blue-200 hover:bg-blue-100" 
                            : "bg-background border-border hover:bg-accent",
                          eventIdx > 0 && "opacity-75"
                        )}
                        style={{ 
                          left: `${4 + eventIdx * 2}px`,
                          right: `${4 + eventIdx * 2}px`,
                          zIndex: 10 - eventIdx
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium leading-none truncate">
                            {event.name}
                          </p>
                          {event.is_first_visit && (
                            <Star 
                              size={10} 
                              className="text-blue-600 fill-blue-600 ml-1 flex-shrink-0" 
                            />
                          )}
                        </div>
                        {event.patient && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {event.patient}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
})

// Componente para el calendario lateral (date picker)
const SidebarDatePicker = React.memo(function SidebarDatePicker({ 
  currentDate, 
  selectedDay, 
  onDateSelect, 
  onMonthChange 
}: {
  currentDate: Date
  selectedDay: Date
  onDateSelect: (date: Date) => void
  onMonthChange: (date: Date) => void
}) {
  const today = startOfToday()
  const [sidebarMonth, setSidebarMonth] = React.useState(currentDate)

  const monthStart = startOfMonth(sidebarMonth)
  const monthEnd = endOfMonth(sidebarMonth)
  const calendarStart = startOfWeek(monthStart, { locale: es })
  const calendarEnd = endOfWeek(monthEnd, { locale: es })
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const navigatePrevMonth = React.useCallback(() => {
    const newMonth = add(sidebarMonth, { months: -1 })
    setSidebarMonth(newMonth)
  }, [sidebarMonth])

  const navigateNextMonth = React.useCallback(() => {
    const newMonth = add(sidebarMonth, { months: 1 })
    setSidebarMonth(newMonth)
  }, [sidebarMonth])

  const handleDateClick = React.useCallback((date: Date) => {
    onDateSelect(date)
    if (!isSameMonth(date, currentDate)) {
      onMonthChange(date)
    }
  }, [onDateSelect, onMonthChange, currentDate])

  const handleGoToToday = React.useCallback(() => {
    const today = startOfToday()
    setSidebarMonth(today)
    handleDateClick(today)
  }, [handleDateClick])

  return (
    <div className="w-64 border-r bg-background p-4 flex-shrink-0">
      <div className="space-y-4">
        {/* Header del date picker */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">
            {format(sidebarMonth, "MMMM yyyy", { locale: es })}
          </h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={navigatePrevMonth}
              className="h-7 w-7 p-0"
              type="button"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateNextMonth}
              className="h-7 w-7 p-0"
              type="button"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
          <div>L</div>
          <div>M</div>
          <div>M</div>
          <div>J</div>
          <div>V</div>
          <div>S</div>
          <div>D</div>
        </div>

        {/* Grid de días */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, dayIdx) => (
            <button
              key={`${format(day, 'yyyy-MM-dd')}-${dayIdx}`}
              onClick={() => handleDateClick(day)}
              type="button"
              className={cn(
                "h-8 w-8 text-xs rounded-md hover:bg-accent hover:text-accent-foreground",
                "flex items-center justify-center transition-colors",
                !isSameMonth(day, sidebarMonth) && "text-muted-foreground/50",
                isToday(day) && "bg-primary text-primary-foreground font-semibold",
                isEqual(day, selectedDay) && !isToday(day) && "bg-accent text-accent-foreground",
              )}
            >
              {format(day, "d")}
            </button>
          ))}
        </div>

        {/* Botón para ir al día actual */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleGoToToday}
          className="w-full"
          type="button"
        >
          Ir a hoy
        </Button>
      </div>
    </div>
  )
})

export function FullScreenCalendar({ 
  data, 
  onAddEvent, 
  onEventClick, 
  onDayDoubleClick, 
  doctors = [], 
  selectedDoctorIds = [], 
  onDoctorFilterChange,
  workingHours = {} 
}: FullScreenCalendarProps) {
  const isDesktop = useIsDesktop()
  const today = startOfToday()
  const [selectedDay, setSelectedDay] = React.useState(today)
  const [currentDate, setCurrentDate] = React.useState(today)
  const [calendarView, setCalendarView] = React.useState<CalendarView>("twoWeeks")
  
  // Obtener los días a mostrar según la vista actual
  const days = React.useMemo(() => {
    if (calendarView === "week") {
      return eachDayOfInterval({
        start: startOfWeek(currentDate, { locale: es }),
        end: endOfWeek(currentDate, { locale: es }),
      })
    } else if (calendarView === "twoWeeks") {
      const weekStart = startOfWeek(currentDate, { locale: es })
      return eachDayOfInterval({
        start: weekStart,
        end: addDays(weekStart, 13), // Dos semanas (14 días)
      })
    } else {
      // Vista mensual
      const monthStart = startOfMonth(currentDate)
      return eachDayOfInterval({
        start: startOfWeek(monthStart, { locale: es }),
        end: endOfWeek(endOfMonth(monthStart), { locale: es }),
      })
    }
  }, [currentDate, calendarView])

  // Calcular el rango de fechas para mostrar en el encabezado
  const dateRange = React.useMemo(() => {
    if (calendarView === "week") {
      const weekStart = startOfWeek(currentDate, { locale: es })
      const weekEnd = endOfWeek(currentDate, { locale: es })
      return {
        start: weekStart,
        end: weekEnd,
        title: format(currentDate, "MMMM yyyy", { locale: es }),
        subtitle: `${format(weekStart, "d MMM", { locale: es })} - ${format(weekEnd, "d MMM, yyyy", { locale: es })}`
      }
    } else if (calendarView === "twoWeeks") {
      const weekStart = startOfWeek(currentDate, { locale: es })
      const twoWeeksEnd = addDays(weekStart, 13)
      return {
        start: weekStart,
        end: twoWeeksEnd,
        title: format(currentDate, "MMMM yyyy", { locale: es }),
        subtitle: `${format(weekStart, "d MMM", { locale: es })} - ${format(twoWeeksEnd, "d MMM, yyyy", { locale: es })}`
      }
    } else {
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)
      return {
        start: monthStart,
        end: monthEnd,
        title: format(currentDate, "MMMM yyyy", { locale: es }),
        subtitle: `${format(monthStart, "d MMM", { locale: es })} - ${format(monthEnd, "d MMM, yyyy", { locale: es })}`
      }
    }
  }, [currentDate, calendarView])

  const navigatePrevious = React.useCallback(() => {
    if (calendarView === "week") {
      setCurrentDate(prev => add(prev, { weeks: -1 }))
    } else if (calendarView === "twoWeeks") {
      setCurrentDate(prev => add(prev, { weeks: -2 }))
    } else {
      setCurrentDate(prev => add(prev, { months: -1 }))
    }
  }, [calendarView])

  const navigateNext = React.useCallback(() => {
    if (calendarView === "week") {
      setCurrentDate(prev => add(prev, { weeks: 1 }))
    } else if (calendarView === "twoWeeks") {
      setCurrentDate(prev => add(prev, { weeks: 2 }))
    } else {
      setCurrentDate(prev => add(prev, { months: 1 }))
    }
  }, [calendarView])

  const goToToday = React.useCallback(() => {
    setCurrentDate(today)
    setSelectedDay(today)
  }, [today])

  const handleDayClick = React.useCallback((day: Date) => {
    setSelectedDay(day)
  }, [])

  const handleDayDoubleClick = React.useCallback((day: Date, time?: string) => {
    if (onDayDoubleClick) {
      onDayDoubleClick(day, time)
    }
  }, [onDayDoubleClick])

  // Handle doctor filter changes
  const handleDoctorToggle = React.useCallback((doctorId: string) => {
    if (!onDoctorFilterChange) return
    
    const newSelectedIds = selectedDoctorIds.includes(doctorId)
      ? selectedDoctorIds.filter(id => id !== doctorId)
      : [...selectedDoctorIds, doctorId]
    
    onDoctorFilterChange(newSelectedIds)
  }, [selectedDoctorIds, onDoctorFilterChange])

  // Calcular filas según la vista
  const gridRows = React.useMemo(() => {
    if (calendarView === "week") {
      return 1
    } else if (calendarView === "twoWeeks") {
      return 2
    } else {
      return Math.ceil(days.length / 7)
    }
  }, [calendarView, days.length])

  return (
    <div className="flex flex-1 h-full">
      {/* Sidebar con date picker - solo en desktop */}
      {isDesktop && (
        <SidebarDatePicker
          currentDate={currentDate}
          selectedDay={selectedDay}
          onDateSelect={setSelectedDay}
          onMonthChange={setCurrentDate}
        />
      )}

      {/* Contenido principal del calendario */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Calendar Header */}
        <div className="flex flex-col space-y-4 p-4 md:flex-row md:items-center md:justify-between md:space-y-0 border-b">
          <div className="flex flex-auto">
            <div className="flex items-center gap-4">
              <div className="hidden w-20 flex-col items-center justify-center rounded-lg border bg-muted p-0.5 md:flex">
                <h1 className="p-1 text-xs uppercase text-muted-foreground">
                  {format(today, "MMM", { locale: es })}
                </h1>
                <div className="flex w-full items-center justify-center rounded-lg border bg-background p-0.5 text-lg font-bold">
                  <span>{format(today, "d")}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold text-foreground">
                  {dateRange.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {dateRange.subtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
            {/* Filtro de doctores */}
            {doctors.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Users size={16} strokeWidth={2} />
                    Doctores
                    <ChevronDown
                      className="-me-1 ms-2 opacity-60"
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {doctors.map((doctor) => (
                    <DropdownMenuCheckboxItem
                      key={doctor.id}
                      checked={selectedDoctorIds.includes(doctor.id)}
                      onCheckedChange={() => handleDoctorToggle(doctor.id)}
                    >
                      {doctor.nombre_completo}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Vista del calendario */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon size={16} strokeWidth={2} />
                  {calendarView === "week" && "Semana"}
                  {calendarView === "twoWeeks" && "Dos Semanas"}
                  {calendarView === "month" && "Mes"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setCalendarView("week")}>
                  Semana
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCalendarView("twoWeeks")}>
                  Dos Semanas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCalendarView("month")}>
                  Mes
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="hidden h-6 md:block" />

            <div className="inline-flex w-full -space-x-px rounded-lg shadow-sm shadow-black/5 md:w-auto rtl:space-x-reverse">
              <Button
                onClick={navigatePrevious}
                className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
                variant="outline"
                size="icon"
                aria-label="Periodo anterior"
                type="button"
              >
                <ChevronLeftIcon size={16} strokeWidth={2} aria-hidden="true" />
              </Button>
              <Button
                onClick={goToToday}
                className="w-full rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 md:w-auto"
                variant="outline"
                type="button"
              >
                Hoy
              </Button>
              <Button
                onClick={navigateNext}
                className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
                variant="outline"
                size="icon"
                aria-label="Periodo siguiente"
                type="button"
              >
                <ChevronRightIcon size={16} strokeWidth={2} aria-hidden="true" />
              </Button>
            </div>

            <Separator orientation="vertical" className="hidden h-6 md:block" />
            <Separator
              orientation="horizontal"
              className="block w-full md:hidden"
            />

            <Button 
              className="w-full gap-2 md:w-auto" 
              onClick={onAddEvent}
              type="button"
            >
              <PlusCircleIcon size={16} strokeWidth={2} aria-hidden="true" />
              <span>Nueva Cita</span>
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Week Days Header */}
          {calendarView === "week" ? (
            <div className="grid grid-cols-8 border-b text-center text-xs font-semibold">
              <div className="border-r py-3 flex items-center justify-center font-medium">Hora</div>
              {days.map((day, dayIdx) => (
                <div key={`header-${format(day, 'yyyy-MM-dd')}-${dayIdx}`} className={cn("border-r py-3 flex flex-col items-center justify-center gap-1", dayIdx === 6 && "border-r-0")}>
                  <button
                    type="button"
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold hover:bg-accent transition-colors",
                      !isToday(day) && !isSameMonth(day, currentDate) && "text-muted-foreground",
                      !isToday(day) && isSameMonth(day, currentDate) && "text-foreground",
                      isToday(day) && "bg-primary text-primary-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </button>
                  <div className="text-xs font-medium">
                    {format(day, "EEE", { locale: es })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 border-b text-center text-xs font-semibold leading-6">
              <div className="border-r py-2.5">Lun</div>
              <div className="border-r py-2.5">Mar</div>
              <div className="border-r py-2.5">Mié</div>
              <div className="border-r py-2.5">Jue</div>
              <div className="border-r py-2.5">Vie</div>
              <div className="border-r py-2.5">Sáb</div>
              <div className="py-2.5">Dom</div>
            </div>
          )}

          {/* Calendar Days */}
          <div className="flex-1 overflow-hidden">
            {calendarView === "week" ? (
              /* Week View with Time Slots */
              <WeekViewWithTimeSlots 
                days={days}
                data={data}
                workingHours={workingHours}
                selectedDay={selectedDay}
                currentDate={currentDate}
                onEventClick={onEventClick}
                onDayClick={handleDayClick}
                onDayDoubleClick={handleDayDoubleClick}
              />
            ) : (
              /* Traditional Grid View */
              <div 
                className={cn(
                  "hidden h-full lg:grid lg:grid-cols-7 border-x",
                  `lg:grid-rows-${gridRows}`
                )}
              >
              {days.map((day, dayIdx) => (
                <div
                  key={`${format(day, 'yyyy-MM-dd')}-${dayIdx}`}
                  className={cn(
                    dayIdx === 0 && getDay(day) !== 1 && colStartClasses[getDay(day)],
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      !isSameMonth(day, currentDate) &&
                      "bg-accent/50 text-muted-foreground",
                    "relative flex flex-col border-b border-r transition-colors",
                    isEqual(day, selectedDay) && !isToday(day) && "bg-accent/75",
                    "min-h-[120px]"
                  )}
                >
                  <header className="flex items-center justify-between p-2.5">
                    <button
                      type="button"
                      className={cn(
                        !isToday(day) &&
                          !isSameMonth(day, currentDate) &&
                          "text-muted-foreground",
                        !isToday(day) &&
                          isSameMonth(day, currentDate) &&
                          "text-foreground",
                        isToday(day) && "bg-primary text-primary-foreground font-semibold",
                        "flex h-7 w-7 items-center justify-center rounded-full text-xs hover:bg-accent transition-colors",
                      )}
                    >
                      <time dateTime={format(day, "yyyy-MM-dd")}>
                        <span>{format(day, "d")}</span>
                      </time>
                    </button>
                  </header>
                  <div 
                    className="flex-1 p-2.5 overflow-y-auto cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleDayClick(day)}
                    onDoubleClick={() => handleDayDoubleClick(day)}
                    title="Haz doble clic para agendar una nueva cita"
                  >
                    {data
                      .filter((event) => isSameDay(event.day, day))
                      .map((dayData) => (
                        <div key={dayData.day.toString()} className="space-y-1.5">
                          {dayData.events.map((event) => (
                            <div
                              key={event.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                onEventClick?.(event)
                              }}
                              className={cn(
                                "flex flex-col items-start gap-1 rounded-lg border p-2 text-xs leading-tight cursor-pointer transition-all duration-200 hover:shadow-sm hover:scale-[1.02] hover:z-10 relative",
                                event.is_first_visit 
                                  ? "bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300" 
                                  : "bg-muted/50 hover:bg-accent hover:border-accent-foreground/20"
                              )}
                            >
                              <div className="flex items-center justify-between w-full">
                                <p className="font-medium leading-none">
                                  {event.name}
                                </p>
                                {event.is_first_visit && (
                                  <Star 
                                    size={12} 
                                    className="text-blue-600 fill-blue-600" 
                                  />
                                )}
                              </div>
                              <div className="flex items-center gap-1 leading-none text-muted-foreground">
                                <Clock size={12} strokeWidth={1.5} />
                                {event.time}
                              </div>
                              {event.patient && (
                                <p className="text-xs text-muted-foreground">
                                  Paciente: {event.patient}
                                </p>
                              )}
                              {event.is_first_visit && (
                                <p className="text-xs text-blue-600 font-medium">
                                  Primera visita
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
            )}

            {/* Mobile Grid */}
            <div className="grid grid-cols-7 grid-rows-5 border-x lg:hidden">
              {days.map((day, dayIdx) => (
                <button
                  onClick={() => handleDayClick(day)}
                  onDoubleClick={() => handleDayDoubleClick(day)}
                  key={`${format(day, 'yyyy-MM-dd')}-mobile-${dayIdx}`}
                  type="button"
                  title="Haz doble clic para agendar una nueva cita"
                  className={cn(
                    isEqual(day, selectedDay) && !isToday(day) && "bg-accent text-accent-foreground",
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      isSameMonth(day, currentDate) &&
                      "text-foreground",
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      !isSameMonth(day, currentDate) &&
                      "text-muted-foreground",
                    isToday(day) && "font-semibold",
                    "flex h-14 flex-col border-b border-r px-3 py-2 hover:bg-muted transition-colors",
                  )}
                >
                  <time
                    dateTime={format(day, "yyyy-MM-dd")}
                    className={cn(
                      "ml-auto flex size-6 items-center justify-center rounded-full",
                      isToday(day) && "bg-primary text-primary-foreground",
                      isEqual(day, selectedDay) && !isToday(day) && "bg-accent text-accent-foreground",
                    )}
                  >
                    {format(day, "d")}
                  </time>
                  {data.filter((date) => isSameDay(date.day, day)).length > 0 && (
                    <div>
                      {data
                        .filter((date) => isSameDay(date.day, day))
                        .map((date) => (
                          <div
                            key={date.day.toString()}
                            className="-mx-0.5 mt-auto flex flex-wrap-reverse"
                          >
                            {date.events.map((event) => (
                              <span
                                key={event.id}
                                className="mx-0.5 mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground"
                              />
                            ))}
                          </div>
                        ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 