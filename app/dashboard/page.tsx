"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Leaf, Calendar } from "lucide-react"
import { AddPlantDialog } from "@/components/add-plant-dialog"
import { PlantCard } from "@/components/plant-card"
import { DashboardStats } from "@/components/dashboard-stats"
import { QuickActions } from "@/components/quick-actions"
import { RecentActivity } from "@/components/recent-activity"
import { TaskItem } from "@/components/task-item"
import { PlantInsights } from "@/components/plant-insights"
import { CareStreak } from "@/components/care-streak"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth-context"
import {
  savePlant,
  getPlants,
  deletePlant,
  subscribeToPlants,
  saveReminder,
  getReminders,
  deleteReminder,
  subscribeToReminders,
  saveTask,
  getTasks,
  updateTask,
  deleteTask,
  subscribeToTasks,
  type Plant,
  type Reminder,
  type Task
} from "@/lib/database"


export default function DashboardPage() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [showAddPlant, setShowAddPlant] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, logout } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/auth/signup")
    }
  }, [user, router])

  // Subscribe to Firebase data
  useEffect(() => {
    if (!user?.uid) return

    setIsLoading(true)
    setError(null)

    // Set a timeout to ensure loading doesn't get stuck
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false)
    }, 10000) // 10 seconds timeout

    try {
      const unsubscribePlants = subscribeToPlants(user.uid, (plants) => {
        setPlants(plants)
        setIsLoading(false)
        clearTimeout(loadingTimeout)
      })
      const unsubscribeReminders = subscribeToReminders(user.uid, setReminders)
      const unsubscribeTasks = subscribeToTasks(user.uid, setTasks)

      return () => {
        clearTimeout(loadingTimeout)
        unsubscribePlants()
        unsubscribeReminders()
        unsubscribeTasks()
      }
    } catch (err) {
      clearTimeout(loadingTimeout)
      setError("Failed to load data. Please refresh the page.")
      setIsLoading(false)
    }
  }, [user?.uid])

  useEffect(() => {
    const generateTasksFromReminders = () => {
      const newTasks: Task[] = []

      reminders.forEach((reminder) => {
        // Check if there's already a pending task for this reminder
        const existingTask = tasks.find((task) => task.reminderId === reminder.id && !task.completed)

        if (!existingTask) {
          // Create a new task if the reminder is due
          const dueDate = new Date(reminder.nextDue)
          const today = new Date()

          if (dueDate <= today) {
            newTasks.push({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              plantId: reminder.plantId,
              reminderId: reminder.id,
              type: reminder.customName || reminder.type,
              dueDate: reminder.nextDue,
              completed: false,
            })
          }
        }
      })

      if (newTasks.length > 0) {
        setTasks((prev) => [...prev, ...newTasks])
      }
    }

    generateTasksFromReminders()
  }, [reminders, tasks])

  const addPlant = async (plant: Omit<Plant, "id" | "dateAdded">) => {
    if (!user?.uid) return

    const newPlant: Plant = {
      ...plant,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString(),
    }

    try {
      await savePlant(user.uid, newPlant)
      // The state will be updated automatically via the subscription
    } catch (error) {
      console.error("Error adding plant:", error)
    }
  }

  const deletePlantData = async (plantId: string) => {
    if (!user?.uid) return

    try {
      await deletePlant(user.uid, plantId)
      // Delete associated reminders and tasks will be handled by the database rules or cleanup
    } catch (error) {
      console.error("Error deleting plant:", error)
    }
  }

  const addReminder = async (reminder: Omit<Reminder, "id">) => {
    if (!user?.uid) return

    const newReminder: Reminder = {
      ...reminder,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }

    try {
      await saveReminder(user.uid, newReminder)
      // The state will be updated automatically via the subscription
    } catch (error) {
      console.error("Error adding reminder:", error)
    }
  }

  const deleteReminderData = async (reminderId: string) => {
    if (!user?.uid) return

    try {
      await deleteReminder(user.uid, reminderId)
      // Delete associated tasks will be handled by the database rules or cleanup
    } catch (error) {
      console.error("Error deleting reminder:", error)
    }
  }

  const completeTask = async (taskId: string) => {
    if (!user?.uid) return

    try {
      // Mark task as completed
      await updateTask(user.uid, taskId, {
        completed: true,
        completedDate: new Date().toISOString(),
      })

      // Update the reminder's next due date
      const task = tasks.find((t) => t.id === taskId)
      if (task) {
        const reminder = reminders.find((r) => r.id === task.reminderId)
        if (reminder) {
          const nextDue = new Date()
          nextDue.setDate(nextDue.getDate() + reminder.frequency)

          await saveReminder(user.uid, {
            ...reminder,
            nextDue: nextDue.toISOString(),
            lastDone: new Date().toISOString(),
          })
        }
      }
    } catch (error) {
      console.error("Error completing task:", error)
    }
  }

  const upcomingTasks = useMemo(() =>
    tasks
      .filter((task) => !task.completed)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5),
    [tasks]
  )

  const completedTasks = useMemo(() =>
    tasks.filter((task) => task.completed),
    [tasks]
  )

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading Growlytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-6">
          <div className="retro-card w-20 h-20 flex items-center justify-center mb-6 bg-destructive/10">
            <Leaf className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Oops!</h2>
          <p className="text-base text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="retro-button"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-background">
          <header className="retro-card sticky top-0 z-40 m-0 rounded-none border-x-0 border-t-0" role="banner">
            <div className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                  <p className="text-sm text-muted-foreground">{user.displayName || "Plant Parent"}</p>
                </div>
                <button
                  onClick={() => setShowAddPlant(true)}
                  className="retro-button text-sm py-2 px-4 flex items-center gap-2"
                  aria-label="Add new plant"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Add
                </button>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"
                  role="status"
                  aria-label="Loading plants"
                ></div>
                <p className="text-muted-foreground" aria-live="polite">Loading your plants...</p>
              </div>
            ) : plants.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
                <div className="retro-card w-20 h-20 flex items-center justify-center mb-6 bg-accent/20">
                  <Leaf className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Welcome!</h2>
                <p className="text-base text-muted-foreground mb-6">
                  Add your first plant to start your care journey
                </p>
                <button onClick={() => setShowAddPlant(true)} className="retro-button flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add First Plant
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <DashboardStats plants={plants} tasks={upcomingTasks} />

                {upcomingTasks.length > 0 && (
                  <div className="retro-card">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Today's Tasks
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">Care needed</p>
                    </div>
                    <div className="space-y-3">
                      {upcomingTasks.map((task) => {
                        const plant = plants.find((p) => p.id === task.plantId)
                        if (!plant) return null
                        return <TaskItem key={task.id} task={task} plant={plant} onCompleteTask={completeTask} />
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground">Your Plants</h2>
                    <div className="retro-card py-1 px-3 text-sm font-semibold">{plants.length}</div>
                  </div>
                  <div className="space-y-4">
                    {plants.map((plant) => (
                      <PlantCard
                        key={plant.id}
                        plant={plant}
                        onDelete={deletePlantData}
                        onAddReminder={addReminder}
                        onDeleteReminder={deleteReminderData}
                        reminders={reminders.filter((r) => r.plantId === plant.id)}
                        tasks={tasks.filter((t) => t.plantId === plant.id && !t.completed)}
                      />
                    ))}
                  </div>
                </div>

                <CareStreak tasks={tasks} />
                <PlantInsights plants={plants} tasks={tasks} reminders={reminders} />
                <RecentActivity plants={plants} completedTasks={completedTasks} />
              </div>
            )}
          </main>

          <AddPlantDialog open={showAddPlant} onOpenChange={setShowAddPlant} onAddPlant={addPlant} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
