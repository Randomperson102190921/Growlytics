"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Flame, Calendar, Target } from "lucide-react"
import type { Task } from "@/app/page"

interface CareStreakProps {
  tasks: Task[]
}

export function CareStreak({ tasks }: CareStreakProps) {
  const completedTasks = tasks
    .filter((task) => task.completed)
    .sort((a, b) => new Date(b.completedDate || b.dueDate).getTime() - new Date(a.completedDate || a.dueDate).getTime())

  const calculateStreak = () => {
    if (completedTasks.length === 0) return 0

    let streak = 0
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    // Check if there's a task completed today
    const today = currentDate.toDateString()
    const hasTaskToday = completedTasks.some((task) => {
      const taskDate = new Date(task.completedDate || task.dueDate)
      return taskDate.toDateString() === today
    })

    if (!hasTaskToday) {
      // If no task today, check yesterday
      currentDate.setDate(currentDate.getDate() - 1)
    }

    // Count consecutive days with completed tasks
    for (let i = 0; i < 30; i++) {
      // Check up to 30 days back
      const dateStr = currentDate.toDateString()
      const hasTaskOnDate = completedTasks.some((task) => {
        const taskDate = new Date(task.completedDate || task.dueDate)
        return taskDate.toDateString() === dateStr
      })

      if (hasTaskOnDate) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  const currentStreak = calculateStreak()
  const totalCompleted = completedTasks.length
  const thisWeekCompleted = completedTasks.filter((task) => {
    const taskDate = new Date(task.completedDate || task.dueDate)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return taskDate >= weekAgo
  }).length

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Start your care streak today!"
    if (streak === 1) return "Great start! Keep it going."
    if (streak < 7) return "Building momentum!"
    if (streak < 14) return "Excellent consistency!"
    if (streak < 30) return "Amazing dedication!"
    return "Plant care master!"
  }

  const getStreakColor = (streak: number) => {
    if (streak === 0) return "text-muted-foreground"
    if (streak < 7) return "text-orange-600"
    if (streak < 14) return "text-yellow-600"
    if (streak < 30) return "text-green-600"
    return "text-blue-600"
  }

  return (
    <div className="retro-card">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-primary" />
        Care Streak
      </h3>
      <div className="text-center mb-4">
        <div className={`text-5xl font-bold ${getStreakColor(currentStreak)} mb-2`}>{currentStreak}</div>
        <p className="text-sm font-semibold text-foreground mb-2">{currentStreak === 1 ? "day" : "days"} in a row</p>
        <div className="retro-card bg-primary/10 text-primary text-xs font-bold py-1 px-3 inline-block">
          {getStreakMessage(currentStreak)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 pt-4 border-t-2 border-border">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-xl font-bold text-foreground">{thisWeekCompleted}</span>
          </div>
          <p className="text-xs text-muted-foreground font-semibold">This week</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xl font-bold text-foreground">{totalCompleted}</span>
          </div>
          <p className="text-xs text-muted-foreground font-semibold">Total</p>
        </div>
      </div>
    </div>
  )
}
