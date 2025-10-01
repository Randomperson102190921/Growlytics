"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Droplets, Sun, Scissors, Package, Leaf, Check } from "lucide-react"
import type { Plant, Task } from "@/app/page"

interface TaskItemProps {
  task: Task
  plant: Plant
  onCompleteTask: (taskId: string) => void
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

export function TaskItem({ task, plant, onCompleteTask }: TaskItemProps) {
  const [isCompleting, setIsCompleting] = useState(false)
  const TaskIcon = getTaskIcon(task.type)
  const isOverdue = new Date(task.dueDate) < new Date()
  const isToday = new Date(task.dueDate).toDateString() === new Date().toDateString()

  const handleComplete = async () => {
    setIsCompleting(true)
    // Add a small delay for better UX
    setTimeout(() => {
      onCompleteTask(task.id)
      setIsCompleting(false)
    }, 300)
  }

  return (
    <div className="retro-card p-3 flex items-center gap-3 bg-background/50">
      <div className="retro-card w-10 h-10 flex items-center justify-center bg-primary/10 flex-shrink-0">
        {isCompleting ? (
          <Check className="w-5 h-5 text-primary animate-in fade-in duration-200" />
        ) : (
          <TaskIcon className="w-5 h-5 text-primary" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground">{plant.name}</p>
        <p className="text-xs text-muted-foreground capitalize">{task.type}</p>
      </div>

      <button onClick={handleComplete} disabled={isCompleting} className="retro-button text-xs py-1 px-3">
        Done
      </button>
    </div>
  )
}
