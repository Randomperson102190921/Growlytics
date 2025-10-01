"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Leaf, Droplets, Sun, Scissors, Package } from "lucide-react"
import type { Plant, Task } from "@/app/page"

interface RecentActivityProps {
  plants: Plant[]
  completedTasks: Task[]
}

const getTaskIcon = (type: string) => {
  switch (type) {
    case "watering":
      return Droplets
    case "fertilizing":
      return Sun
    case "pruning":
      return Scissors
    case "repotting":
      return Package
    default:
      return Leaf
  }
}

export function RecentActivity({ plants, completedTasks }: RecentActivityProps) {
  const recentActivity = [
    ...plants.slice(-3).map((plant) => ({
      id: plant.id,
      type: "plant_added" as const,
      plantName: plant.name,
      date: plant.dateAdded,
      description: `Added ${plant.name} to your garden`,
    })),
    ...completedTasks.slice(-5).map((task) => ({
      id: task.id,
      type: "task_completed" as const,
      plantName: plants.find((p) => p.id === task.plantId)?.name || "Unknown Plant",
      date: task.completedDate || task.dueDate,
      description: `Completed ${task.type} for ${plants.find((p) => p.id === task.plantId)?.name}`,
      taskType: task.type,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div className="retro-card">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        Recent Activity
      </h3>
      {recentActivity.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-2">
              <div className="retro-card w-8 h-8 flex items-center justify-center bg-primary/10 flex-shrink-0">
                {activity.type === "plant_added" ? (
                  <Leaf className="w-4 h-4 text-primary" />
                ) : (
                  (() => {
                    const TaskIcon = getTaskIcon(activity.taskType || "")
                    return <TaskIcon className="w-4 h-4 text-primary" />
                  })()
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{new Date(activity.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
