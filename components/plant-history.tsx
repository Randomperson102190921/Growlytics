"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, Droplets, Sun, Scissors, Package, Leaf } from "lucide-react"
import type { Plant, Task } from "@/app/page"

interface PlantHistoryProps {
  plant: Plant
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

export function PlantHistory({ plant, completedTasks }: PlantHistoryProps) {
  const plantTasks = completedTasks
    .filter((task) => task.plantId === plant.id)
    .sort((a, b) => new Date(b.completedDate || b.dueDate).getTime() - new Date(a.completedDate || a.dueDate).getTime())
    .slice(0, 10) // Show last 10 completed tasks

  if (plantTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Care History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No care history yet</p>
            <p className="text-xs text-muted-foreground mt-1">Complete some tasks to see your care history</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Care History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {plantTasks.map((task) => {
            const TaskIcon = getTaskIcon(task.type)
            const completedDate = new Date(task.completedDate || task.dueDate)

            return (
              <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TaskIcon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground capitalize">{task.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {completedDate.toLocaleDateString()} at{" "}
                    {completedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  Completed
                </Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
