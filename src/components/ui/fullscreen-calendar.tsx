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
  parse,
  startOfMonth,
  startOfToday,
  startOfWeek,
  addWeeks,
  addDays,
} from "date-fns"
import { es } from "date-fns/locale"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
  SearchIcon,
  CalendarIcon,
  Clock
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
}

interface CalendarData {
  day: Date
  events: Event[]
}

interface FullScreenCalendarProps {
  data: CalendarData[]
  onAddEvent?: () => void
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

export function FullScreenCalendar({ data, onAddEvent }: FullScreenCalendarProps) {
  const today = startOfToday()
  const [selectedDay, setSelectedDay] = React.useState(today)
  const [currentDate, setCurrentDate] = React.useState(today)
  const [calendarView, setCalendarView] = React.useState<CalendarView>("twoWeeks")
  const isDesktop = useMediaQuery("(min-width: 768px)")

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

  function navigatePrevious() {
    if (calendarView === "week") {
      setCurrentDate(prev => add(prev, { weeks: -1 }))
    } else if (calendarView === "twoWeeks") {
      setCurrentDate(prev => add(prev, { weeks: -2 }))
    } else {
      setCurrentDate(prev => add(prev, { months: -1 }))
    }
  }

  function navigateNext() {
    if (calendarView === "week") {
      setCurrentDate(prev => add(prev, { weeks: 1 }))
    } else if (calendarView === "twoWeeks") {
      setCurrentDate(prev => add(prev, { weeks: 2 }))
    } else {
      setCurrentDate(prev => add(prev, { months: 1 }))
    }
  }

  function goToToday() {
    setCurrentDate(today)
    setSelectedDay(today)
  }

  // Calcular filas y columnas según la vista
  const gridConfig = React.useMemo(() => {
    if (calendarView === "week") {
      return {
        cols: 7,
        rows: 1,
      }
    } else if (calendarView === "twoWeeks") {
      return {
        cols: 7,
        rows: 2,
      }
    } else {
      // Default: month view
      return {
        cols: 7,
        rows: Math.ceil(days.length / 7),
      }
    }
  }, [calendarView, days.length])

  return (
    <div className="flex flex-1 flex-col">
      {/* Calendar Header */}
      <div className="flex flex-col space-y-4 p-4 md:flex-row md:items-center md:justify-between md:space-y-0 lg:flex-none">
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
            <DropdownMenuContent align="end" className="z-[9999]">
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
            >
              <ChevronLeftIcon size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
            <Button
              onClick={goToToday}
              className="w-full rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 md:w-auto"
              variant="outline"
            >
              Hoy
            </Button>
            <Button
              onClick={navigateNext}
              className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
              variant="outline"
              size="icon"
              aria-label="Periodo siguiente"
            >
              <ChevronRightIcon size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
          </div>

          <Separator orientation="vertical" className="hidden h-6 md:block" />
          <Separator
            orientation="horizontal"
            className="block w-full md:hidden"
          />

          <Button className="w-full gap-2 md:w-auto" onClick={onAddEvent}>
            <PlusCircleIcon size={16} strokeWidth={2} aria-hidden="true" />
            <span>Nueva Cita</span>
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="lg:flex lg:flex-auto lg:flex-col">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 border text-center text-xs font-semibold leading-6 lg:flex-none">
          <div className="border-r py-2.5">Lun</div>
          <div className="border-r py-2.5">Mar</div>
          <div className="border-r py-2.5">Mié</div>
          <div className="border-r py-2.5">Jue</div>
          <div className="border-r py-2.5">Vie</div>
          <div className="border-r py-2.5">Sáb</div>
          <div className="py-2.5">Dom</div>
        </div>

        {/* Calendar Days */}
        <div className="flex text-xs leading-6 lg:flex-auto">
          <div className={`hidden w-full border-x lg:grid lg:grid-cols-7 lg:grid-rows-${gridConfig.rows}`}>
            {days.map((day, dayIdx) =>
              !isDesktop ? (
                <button
                  onClick={() => setSelectedDay(day)}
                  key={dayIdx}
                  type="button"
                  className={cn(
                    isEqual(day, selectedDay) && "text-primary-foreground",
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      isSameMonth(day, currentDate) &&
                      "text-foreground",
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      !isSameMonth(day, currentDate) &&
                      "text-muted-foreground",
                    (isEqual(day, selectedDay) || isToday(day)) &&
                      "font-semibold",
                    "flex h-14 flex-col border-b border-r px-3 py-2 hover:bg-muted focus:z-10",
                  )}
                >
                  <time
                    dateTime={format(day, "yyyy-MM-dd")}
                    className={cn(
                      "ml-auto flex size-6 items-center justify-center rounded-full",
                      isEqual(day, selectedDay) &&
                        isToday(day) &&
                        "bg-primary text-primary-foreground",
                      isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        "bg-primary text-primary-foreground",
                    )}
                  >
                    {format(day, "d")}
                  </time>
                  {data.filter((date) => isSameDay(date.day, day)).length >
                    0 && (
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
              ) : (
                <div
                  key={dayIdx}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    // Usar los días de la semana con lunes como primer día (0-6 -> 1-7)
                    dayIdx === 0 && getDay(day) !== 1 && colStartClasses[getDay(day)],
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      !isSameMonth(day, currentDate) &&
                      "bg-accent/50 text-muted-foreground",
                    "relative flex flex-col border-b border-r hover:bg-muted focus:z-10",
                    !isEqual(day, selectedDay) && "hover:bg-accent/75",
                    "cursor-pointer",
                    calendarView === "week" ? "h-[calc(100vh-16rem)]" : ""
                  )}
                >
                  <header className="flex items-center justify-between p-2.5">
                    <button
                      type="button"
                      className={cn(
                        isEqual(day, selectedDay) && "text-primary-foreground",
                        !isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          isSameMonth(day, currentDate) &&
                          "text-foreground",
                        !isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          !isSameMonth(day, currentDate) &&
                          "text-muted-foreground",
                        isEqual(day, selectedDay) &&
                          isToday(day) &&
                          "border-none bg-primary",
                        isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          "bg-foreground",
                        (isEqual(day, selectedDay) || isToday(day)) &&
                          "font-semibold",
                        "flex h-7 w-7 items-center justify-center rounded-full text-xs hover:border",
                      )}
                    >
                      <time dateTime={format(day, "yyyy-MM-dd")} className="flex items-center justify-center">
                        <span>{format(day, "d")}</span>
                      </time>
                    </button>
                  </header>
                  <div className="flex-1 p-2.5 overflow-y-auto">
                    {data
                      .filter((event) => isSameDay(event.day, day))
                      .map((day) => (
                        <div key={day.day.toString()} className="space-y-1.5">
                          {day.events.map((event) => (
                            <div
                              key={event.id}
                              className="flex flex-col items-start gap-1 rounded-lg border bg-muted/50 p-2 text-xs leading-tight"
                            >
                              <p className="font-medium leading-none">
                                {event.name}
                              </p>
                              <div className="flex items-center gap-1 leading-none text-muted-foreground">
                                <Clock size={12} strokeWidth={1.5} />
                                {event.time}
                              </div>
                              {event.patient && (
                                <p className="text-xs text-muted-foreground">
                                  Paciente: {event.patient}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                  </div>
                </div>
              ),
            )}
          </div>

          <div className="isolate grid w-full grid-cols-7 grid-rows-5 border-x lg:hidden">
            {days.map((day, dayIdx) => (
              <button
                onClick={() => setSelectedDay(day)}
                key={dayIdx}
                type="button"
                className={cn(
                  isEqual(day, selectedDay) && "text-primary-foreground",
                  !isEqual(day, selectedDay) &&
                    !isToday(day) &&
                    isSameMonth(day, currentDate) &&
                    "text-foreground",
                  !isEqual(day, selectedDay) &&
                    !isToday(day) &&
                    !isSameMonth(day, currentDate) &&
                    "text-muted-foreground",
                  (isEqual(day, selectedDay) || isToday(day)) &&
                    "font-semibold",
                  "flex h-14 flex-col border-b border-r px-3 py-2 hover:bg-muted focus:z-10",
                )}
              >
                <time
                  dateTime={format(day, "yyyy-MM-dd")}
                  className={cn(
                    "ml-auto flex size-6 items-center justify-center rounded-full",
                    isEqual(day, selectedDay) &&
                      isToday(day) &&
                      "bg-primary text-primary-foreground",
                    isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      "bg-primary text-primary-foreground",
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
  )
} 