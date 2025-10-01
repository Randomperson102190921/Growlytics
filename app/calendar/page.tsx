"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, Droplets, Sun, Scissors, Package, Leaf, ChevronLeft, ChevronRight } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth-context"
import { subscribeToPlants, subscribeToReminders, subscribeToTasks, type Plant, type Reminder, type Task } from "@/lib/database"
import { format, isSameDay, startOfMonth, endOfMonth, addMonths, subMonths, isValid, getDaysInMonth, getDay, startOfWeek, addDays } from "date-fns"

interface CalendarTask {
  id: string
  plantName: string
  type: string
  dueDate: string
  completed: boolean
  isOverdue: boolean
}

export default function CalendarPage() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/auth/signup")
      return
    }
  }, [user, router])

  useEffect(() => {
    if (!user?.uid) return

    const unsubscribePlants = subscribeToPlants(user.uid, setPlants)
    const unsubscribeReminders = subscribeToReminders(user.uid, setReminders)
    const unsubscribeTasks = subscribeToTasks(user.uid, setTasks)

    return () => {
      unsubscribePlants()
      unsubscribeReminders()
      unsubscribeTasks()
    }
  }, [user?.uid])

  const safeDate = (dateString?: string): Date | null => {
    if (!dateString) return null
    const d = new Date(dateString)
    return isValid(d) ? d : null
  }

  const safeDateOrDefault = (dateString?: string): Date => {
    const d = safeDate(dateString)
    return d || new Date()
  }

  const getTaskIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "watering": return Droplets
      case "fertilizing": return Sun
      case "pruning": return Scissors
      case "repotting": return Package
      default: return Leaf
    }
  }

  const generateCalendarTasks = (): CalendarTask[] => {
    const calendarTasks: CalendarTask[] = []
    const today = new Date()
    const endDate = addMonths(today, 3)

    tasks.forEach((task) => {
      const plant = plants.find((p) => p.id === task.plantId)
      const due = safeDate(task.dueDate)
      if (plant && due) {
        calendarTasks.push({
          id: task.id,
          plantName: plant.name,
          type: task.type,
          dueDate: due.toISOString(),
          completed: task.completed,
          isOverdue: !task.completed && due < today,
        })
      }
    })

    reminders.forEach((reminder) => {
      const plant = plants.find((p) => p.id === reminder.plantId)
      let nextDue = safeDate(reminder.nextDue)
      if (!plant || !nextDue) return

      let count = 0
      while (nextDue <= endDate && count < 50) { // Limit to 50 future tasks per reminder
        const existingTask = tasks.find((task) => task.reminderId === reminder.id && isSameDay(safeDateOrDefault(task.dueDate), nextDue))
        if (!existingTask) {
          calendarTasks.push({
            id: `future-${reminder.id}-${nextDue.getTime()}`,
            plantName: plant.name,
            type: reminder.customName || reminder.type,
            dueDate: nextDue.toISOString(),
            completed: false,
            isOverdue: false,
          })
          count++
        }
        nextDue = new Date(nextDue.getTime() + reminder.frequency * 86400000)
      }
    })

    return calendarTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }

  const calendarTasks = generateCalendarTasks()
  const selectedDateTasks = calendarTasks.filter((task) => isSameDay(new Date(task.dueDate), selectedDate))

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getDay(startOfMonth(currentMonth))
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-16" />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const dayTasks = calendarTasks.filter((task) => isSameDay(new Date(task.dueDate), date))
      const isToday = isSameDay(date, new Date())
      const isSelected = isSameDay(date, selectedDate)
      const hasOverdue = dayTasks.some((t) => t.isOverdue)

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-16 p-1 border-2 relative transition-all ${
            isSelected
              ? "bg-primary text-primary-foreground border-border shadow-[3px_3px_0_var(--border)]"
              : isToday
              ? "bg-accent/30 border-primary"
              : "bg-card border-border hover:shadow-[2px_2px_0_var(--border)]"
          }`}
        >
          <div className="text-sm font-semibold">{day}</div>
          {dayTasks.length > 0 && (
            <div className="flex gap-0.5 justify-center mt-1 flex-wrap">
              {dayTasks.slice(0, 3).map((task, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full ${
                    task.completed ? "bg-green-500" : hasOverdue ? "bg-destructive" : "bg-primary"
                  }`}
                />
              ))}
            </div>
          )}
        </button>
      )
    }

    return days
  }

  if (!user) return <div>Loading...</div>

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-background">
          <header className="retro-card sticky top-0 z-40 m-0 rounded-none border-x-0 border-t-0">
            <div className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-6 h-6 text-primary" />
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
                    <p className="text-sm text-muted-foreground">Care schedule</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 space-y-6">
            <div className="retro-card">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="retro-button py-2 px-3">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h2 className="text-lg font-bold">{format(currentMonth, "MMMM yyyy")}</h2>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="retro-button py-2 px-3">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <div key={i} className="text-center text-xs font-bold text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>

              <button
                onClick={() => {
                  setCurrentMonth(new Date())
                  setSelectedDate(new Date())
                }}
                className="retro-button w-full mt-4"
              >
                Today
              </button>
            </div>

            {selectedDateTasks.length > 0 && (
              <div className="retro-card">
                <h3 className="text-lg font-bold mb-4">{format(selectedDate, "MMMM d, yyyy")}</h3>
                <div className="space-y-3">
                  {selectedDateTasks.map((task) => {
                    const Icon = getTaskIcon(task.type)
                    return (
                      <div
                        key={task.id}
                        className={`retro-card p-3 flex items-center gap-3 ${
                          task.completed ? "opacity-60" : task.isOverdue ? "border-destructive" : ""
                        }`}
                      >
                        <div className={`retro-card w-10 h-10 flex items-center justify-center ${task.completed ? "bg-green-100" : "bg-primary/10"}`}>
                          <Icon className={`w-5 h-5 ${task.completed ? "text-green-600" : "text-primary"}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{task.plantName}</div>
                          <div className="text-xs text-muted-foreground capitalize">{task.type}</div>
                        </div>
                        {task.completed && (
                          <div className="retro-card bg-green-100 text-green-700 px-2 py-1 text-xs font-bold">Done</div>
                        )}
                        {task.isOverdue && !task.completed && (
                          <div className="retro-card bg-destructive/10 text-destructive px-2 py-1 text-xs font-bold">Overdue</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {selectedDateTasks.length === 0 && (
              <div className="retro-card text-center py-8">
                <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No tasks for this date</p>
              </div>
            )}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
