"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoveVertical as MoreVertical, Leaf, Droplets, Calendar, Trash2, Plus, Sun, Scissors, Package } from "lucide-react"
import type { Plant, Reminder, Task } from "@/lib/database"
import { AddReminderDialog } from "./add-reminder-dialog"

interface PlantCardProps {
  plant: Plant
  reminders: Reminder[]
  tasks: Task[]
  onDelete: (plantId: string) => void
  onAddReminder: (reminder: Omit<Reminder, "id">) => void
  onDeleteReminder: (reminderId: string) => void
}

const getReminderIcon = (type: string) => {
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

export function PlantCard({ plant, reminders, tasks, onDelete, onAddReminder, onDeleteReminder }: PlantCardProps) {
  const [showAddReminder, setShowAddReminder] = useState(false)

  const overdueTasks = tasks.filter((task) => new Date(task.dueDate) < new Date())
  const upcomingTasks = tasks.filter((task) => new Date(task.dueDate) >= new Date())

  return (
    <>
      <div className="app-card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {plant.photo ? (
              <img src={plant.photo || "/placeholder.svg"} alt={plant.name} className="w-14 h-14 rounded-lg object-cover border border-border" />
            ) : (
              <div className="w-14 h-14 flex items-center justify-center bg-primary/10 rounded-lg">
                <Leaf className="w-7 h-7 text-primary" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-foreground">{plant.name}</h3>
              <p className="text-sm text-muted-foreground">{plant.type}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-secondary transition-colors touch-target">
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowAddReminder(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Reminder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(plant.id)} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Plant
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {reminders.length > 0 ? (
          <div className="space-y-3 mb-4">
            <h4 className="text-sm font-semibold text-foreground">Reminders</h4>
            <div className="space-y-2">
              {reminders.map((reminder) => {
                const Icon = getReminderIcon(reminder.type)
                const nextDue = new Date(reminder.nextDue)
                const isOverdue = nextDue < new Date()
                return (
                  <div key={reminder.id} className="p-3 flex items-center justify-between bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium capitalize">{reminder.customName || reminder.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                        {isOverdue ? "Overdue" : nextDue.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <button onClick={() => onDeleteReminder(reminder.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 mb-4 border border-dashed border-border rounded-lg">
            <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">No reminders</p>
            <button onClick={() => setShowAddReminder(true)} className="app-button text-xs">
              Add Reminder
            </button>
          </div>
        )}

        {tasks.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {overdueTasks.length > 0 && (
              <div className="bg-destructive/10 text-destructive text-xs font-semibold py-1 px-2 rounded-md">
                {overdueTasks.length} overdue
              </div>
            )}
            {upcomingTasks.length > 0 && (
              <div className="bg-primary/10 text-primary text-xs font-semibold py-1 px-2 rounded-md">
                {upcomingTasks.length} upcoming
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground border-t border-border pt-3">
          Added {new Date(plant.dateAdded).toLocaleDateString()}
        </div>

        {plant.notes && <p className="text-sm text-muted-foreground mt-2 italic">{plant.notes}</p>}
      </div>

      <AddReminderDialog open={showAddReminder} onOpenChange={setShowAddReminder} onAddReminder={onAddReminder} plantId={plant.id} plantName={plant.name} />
    </>
  )
}
