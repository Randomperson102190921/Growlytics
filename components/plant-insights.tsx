"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, TrendingUp, CircleAlert as AlertCircle, CircleCheck as CheckCircle } from "lucide-react"
import type { Plant, Task, Reminder } from "@/app/page"

interface PlantInsightsProps {
  plants: Plant[]
  tasks: Task[]
  reminders: Reminder[]
}

interface Insight {
  id: string
  type: "tip" | "warning" | "success" | "info"
  title: string
  message: string
  plantId?: string
}

export function PlantInsights({ plants, tasks, reminders }: PlantInsightsProps) {
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = []
    const completedTasks = tasks.filter((task) => task.completed)
    const overdueTasks = tasks.filter((task) => !task.completed && new Date(task.dueDate) < new Date())

    // General tips based on plant collection
    if (plants.length >= 3) {
      insights.push({
        id: "collection-tip",
        type: "tip",
        title: "Growing Collection",
        message: `You have ${plants.length} plants! Consider grouping plants with similar care needs together to make maintenance easier.`,
      })
    }

    // Watering consistency insights
    const wateringTasks = completedTasks.filter((task) => task.type === "watering")
    if (wateringTasks.length >= 5) {
      const recentWatering = wateringTasks.slice(-5)
      const avgDaysBetween =
        recentWatering.reduce((acc, task, index) => {
          if (index === 0) return acc
          const prevDate = new Date(recentWatering[index - 1].completedDate || recentWatering[index - 1].dueDate)
          const currDate = new Date(task.completedDate || task.dueDate)
          return acc + (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        }, 0) /
        (recentWatering.length - 1)

      if (avgDaysBetween <= 3) {
        insights.push({
          id: "watering-frequency",
          type: "warning",
          title: "Frequent Watering",
          message:
            "You've been watering quite frequently. Make sure to check soil moisture before watering to avoid overwatering.",
        })
      } else if (avgDaysBetween >= 10) {
        insights.push({
          id: "watering-spacing",
          type: "info",
          title: "Watering Schedule",
          message:
            "You have good spacing between watering sessions. This helps prevent root rot and promotes healthy growth.",
        })
      }
    }

    // Overdue task warnings
    if (overdueTasks.length > 0) {
      const overdueWatering = overdueTasks.filter((task) => task.type === "watering")
      if (overdueWatering.length > 0) {
        insights.push({
          id: "overdue-watering",
          type: "warning",
          title: "Watering Overdue",
          message: `${overdueWatering.length} plant${overdueWatering.length > 1 ? "s need" : " needs"} watering. Check soil moisture and water if dry.`,
        })
      }
    }

    // Success feedback for consistent care
    if (completedTasks.length >= 10) {
      const recentTasks = completedTasks.slice(-10)
      const onTimeCompletions = recentTasks.filter((task) => {
        const dueDate = new Date(task.dueDate)
        const completedDate = new Date(task.completedDate || task.dueDate)
        return completedDate <= dueDate
      })

      if (onTimeCompletions.length >= 8) {
        insights.push({
          id: "consistent-care",
          type: "success",
          title: "Excellent Care!",
          message: "You've been very consistent with plant care. Your plants are thriving thanks to your dedication!",
        })
      }
    }

    // Plant-specific insights
    plants.forEach((plant) => {
      const plantTasks = completedTasks.filter((task) => task.plantId === plant.id)
      const plantReminders = reminders.filter((reminder) => reminder.plantId === plant.id)

      // New plant tip
      const daysSinceAdded = (new Date().getTime() - new Date(plant.dateAdded).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceAdded <= 7 && plantTasks.length === 0) {
        insights.push({
          id: `new-plant-${plant.id}`,
          type: "tip",
          title: "New Plant Care",
          message: `${plant.name} is new to your collection. Monitor it closely for the first few weeks to establish a good care routine.`,
          plantId: plant.id,
        })
      }

      // No reminders set
      if (plantReminders.length === 0 && daysSinceAdded > 1) {
        insights.push({
          id: `no-reminders-${plant.id}`,
          type: "info",
          title: "Set Up Reminders",
          message: `Consider setting up care reminders for ${plant.name} to maintain a consistent care schedule.`,
          plantId: plant.id,
        })
      }
    })

    // Seasonal tips (basic example)
    const currentMonth = new Date().getMonth()
    if (currentMonth >= 2 && currentMonth <= 4) {
      // Spring
      insights.push({
        id: "seasonal-spring",
        type: "tip",
        title: "Spring Growth Season",
        message:
          "Spring is here! This is the perfect time to increase watering frequency and start fertilizing as plants enter their growing season.",
      })
    } else if (currentMonth >= 5 && currentMonth <= 7) {
      // Summer
      insights.push({
        id: "seasonal-summer",
        type: "tip",
        title: "Summer Care",
        message:
          "Summer heat means plants may need more frequent watering. Check soil moisture regularly and provide shade for sensitive plants.",
      })
    } else if (currentMonth >= 8 && currentMonth <= 10) {
      // Fall
      insights.push({
        id: "seasonal-fall",
        type: "tip",
        title: "Fall Preparation",
        message:
          "As temperatures drop, reduce watering frequency and stop fertilizing most plants to prepare them for winter dormancy.",
      })
    } else {
      // Winter
      insights.push({
        id: "seasonal-winter",
        type: "tip",
        title: "Winter Care",
        message:
          "Winter means slower growth and less water needs. Reduce watering frequency and watch for dry air affecting your plants.",
      })
    }

    return insights.slice(0, 4) // Limit to 4 insights to avoid overwhelming the user
  }

  const insights = generateInsights()

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "tip":
        return Lightbulb
      case "warning":
        return AlertCircle
      case "success":
        return CheckCircle
      case "info":
        return TrendingUp
      default:
        return Lightbulb
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case "tip":
        return "text-blue-600"
      case "warning":
        return "text-yellow-600"
      case "success":
        return "text-green-600"
      case "info":
        return "text-purple-600"
      default:
        return "text-blue-600"
    }
  }

  const getInsightBadgeVariant = (type: string) => {
    switch (type) {
      case "warning":
        return "destructive" as const
      case "success":
        return "default" as const
      default:
        return "secondary" as const
    }
  }

  return (
    <div className="retro-card">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-primary" />
        Insights
      </h3>
      {insights.length === 0 ? (
        <div className="text-center py-8">
          <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Keep caring!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => {
            const Icon = getInsightIcon(insight.type)
            const plant = insight.plantId ? plants.find((p) => p.id === insight.plantId) : null
            return (
              <div key={insight.id} className="retro-card p-3 bg-background/50">
                <div className="flex items-start gap-3">
                  <div className="retro-card w-9 h-9 flex items-center justify-center bg-primary/10 flex-shrink-0">
                    <Icon className={`w-5 h-5 ${getInsightColor(insight.type)}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-foreground mb-1">{insight.title}</h4>
                    <p className="text-xs text-muted-foreground">{insight.message}</p>
                    {plant && <p className="text-xs text-primary mt-1 font-semibold">{plant.name}</p>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
