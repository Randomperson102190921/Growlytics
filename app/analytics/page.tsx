"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChartBar as BarChart3, TrendingUp, Calendar, Leaf, Target, Droplets, Sun } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth-context"
import { subscribeToPlants, subscribeToReminders, subscribeToTasks, type Plant, type Reminder, type Task } from "@/lib/database"

export default function AnalyticsPage() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
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

  const completedTasks = tasks.filter((task) => task.completed)
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0

  const wateringTasks = tasks.filter((task) => task.type === "watering")
  const fertilizingTasks = tasks.filter((task) => task.type === "fertilizing")

  const calculateStreak = () => {
    if (completedTasks.length === 0) return 0
    const sortedTasks = completedTasks.sort((a, b) => new Date(b.completedDate || b.dueDate).getTime() - new Date(a.completedDate || a.dueDate).getTime())
    let streak = 0
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (let i = 0; i < 30; i++) {
      const dateStr = currentDate.toDateString()
      const hasTaskOnDate = sortedTasks.some((task) => {
        const taskDate = new Date(task.completedDate || task.dueDate)
        return taskDate.toDateString() === dateStr
      })

      if (hasTaskOnDate) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else if (streak > 0) {
        break
      } else {
        currentDate.setDate(currentDate.getDate() - 1)
      }
    }

    return streak
  }

  const currentStreak = calculateStreak()

  const plantPerformance = plants.map((plant) => {
    const plantTasks = tasks.filter((task) => task.plantId === plant.id)
    const completedPlantTasks = plantTasks.filter((task) => task.completed)
    const rate = plantTasks.length > 0 ? Math.round((completedPlantTasks.length / plantTasks.length) * 100) : 0
    return { name: plant.name, type: plant.type, totalTasks: plantTasks.length, completedTasks: completedPlantTasks.length, completionRate: rate }
  }).sort((a, b) => b.completionRate - a.completionRate)

  if (!user) return <div>Loading...</div>

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-background">
          <header className="retro-card sticky top-0 z-40 m-0 rounded-none border-x-0 border-t-0">
            <div className="px-4 py-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
                  <p className="text-sm text-muted-foreground">Your stats</p>
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 space-y-6">
            {plants.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
                <div className="retro-card w-20 h-20 flex items-center justify-center mb-6 bg-accent/20">
                  <BarChart3 className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">No Data Yet</h2>
                <p className="text-base text-muted-foreground mb-6">Add plants and complete tasks</p>
                <button onClick={() => router.push("/dashboard")} className="retro-button flex items-center gap-2">
                  <Leaf className="w-5 h-5" />
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="retro-card text-center">
                    <Leaf className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-3xl font-bold text-foreground mb-1">{plants.length}</div>
                    <p className="text-xs font-semibold text-foreground">Plants</p>
                  </div>
                  <div className="retro-card text-center">
                    <Target className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-3xl font-bold text-foreground mb-1">{completedTasks.length}</div>
                    <p className="text-xs font-semibold text-foreground">Completed</p>
                  </div>
                  <div className="retro-card text-center">
                    <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-3xl font-bold text-foreground mb-1">{completionRate}%</div>
                    <p className="text-xs font-semibold text-foreground">Rate</p>
                  </div>
                  <div className="retro-card text-center">
                    <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-3xl font-bold text-foreground mb-1">{currentStreak}</div>
                    <p className="text-xs font-semibold text-foreground">Streak</p>
                  </div>
                </div>

                <div className="retro-card">
                  <h3 className="text-lg font-bold mb-4">Task Types</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-primary" />
                        <span className="text-sm font-semibold">Watering</span>
                      </div>
                      <div className="retro-card bg-primary/10 text-primary px-3 py-1 text-sm font-bold">{wateringTasks.length}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sun className="w-5 h-5 text-primary" />
                        <span className="text-sm font-semibold">Fertilizing</span>
                      </div>
                      <div className="retro-card bg-primary/10 text-primary px-3 py-1 text-sm font-bold">{fertilizingTasks.length}</div>
                    </div>
                  </div>
                </div>

                <div className="retro-card">
                  <h3 className="text-lg font-bold mb-4">Plant Performance</h3>
                  {plantPerformance.length > 0 ? (
                    <div className="space-y-3">
                      {plantPerformance.map((plant) => (
                        <div key={plant.name} className="retro-card p-3 bg-background/50 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="retro-card w-10 h-10 flex items-center justify-center bg-primary/10">
                              <Leaf className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold">{plant.name}</h4>
                              <p className="text-xs text-muted-foreground">{plant.completedTasks}/{plant.totalTasks} tasks</p>
                            </div>
                          </div>
                          <div className={`retro-card px-3 py-1 text-sm font-bold ${plant.completionRate >= 80 ? "bg-green-100 text-green-700" : plant.completionRate >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                            {plant.completionRate}%
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No task data yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
