"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Calendar, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Droplets, Sun } from "lucide-react"
import type { Plant, Task } from "@/app/page"

interface DashboardStatsProps {
  plants: Plant[]
  tasks: Task[]
}

export function DashboardStats({ plants, tasks }: DashboardStatsProps) {
  const overdueTasks = tasks.filter((task) => new Date(task.dueDate) < new Date())
  const todayTasks = tasks.filter((task) => {
    const today = new Date().toDateString()
    return new Date(task.dueDate).toDateString() === today
  })

  const wateringTasks = tasks.filter((task) => task.type === "watering")
  const fertilizingTasks = tasks.filter((task) => task.type === "fertilizing")

  const stats = [
    {
      title: "Total Plants",
      value: plants.length,
      icon: Leaf,
      color: "text-primary",
      description: "in your garden",
    },
    {
      title: "Due Today",
      value: todayTasks.length,
      icon: Calendar,
      color: "text-blue-600",
      description: "tasks to complete",
    },
    {
      title: "Overdue",
      value: overdueTasks.length,
      icon: AlertTriangle,
      color: "text-destructive",
      description: "need attention",
    },
    {
      title: "This Week",
      value: tasks.filter((task) => {
        const taskDate = new Date(task.dueDate)
        const today = new Date()
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        return taskDate >= today && taskDate <= weekFromNow
      }).length,
      icon: CheckCircle,
      color: "text-green-600",
      description: "upcoming tasks",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="retro-card text-center">
          <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
          <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
          <p className="text-xs font-semibold text-foreground">{stat.title}</p>
          <p className="text-xs text-muted-foreground">{stat.description}</p>
        </div>
      ))}
    </div>
  )
}
