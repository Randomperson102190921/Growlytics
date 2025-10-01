"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Droplets, Sun, Scissors, Package, Leaf } from "lucide-react"
import type { Reminder } from "@/app/page"

interface AddReminderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddReminder: (reminder: Omit<Reminder, "id">) => void
  plantId: string
  plantName: string
}

const reminderTypes = [
  { value: "watering", label: "Watering", icon: Droplets },
  { value: "fertilizing", label: "Fertilizing", icon: Sun },
  { value: "pruning", label: "Pruning", icon: Scissors },
  { value: "repotting", label: "Repotting", icon: Package },
  { value: "other", label: "Other", icon: Leaf },
]

const frequencyOptions = [
  { value: 1, label: "Daily" },
  { value: 2, label: "Every 2 days" },
  { value: 3, label: "Every 3 days" },
  { value: 7, label: "Weekly" },
  { value: 14, label: "Every 2 weeks" },
  { value: 21, label: "Every 3 weeks" },
  { value: 30, label: "Monthly" },
  { value: 60, label: "Every 2 months" },
  { value: 90, label: "Every 3 months" },
  { value: 180, label: "Every 6 months" },
  { value: 365, label: "Yearly" },
]

export function AddReminderDialog({ open, onOpenChange, onAddReminder, plantId, plantName }: AddReminderDialogProps) {
  const [type, setType] = useState<string>("")
  const [frequency, setFrequency] = useState<number>(7)
  const [customName, setCustomName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!type) return

    const nextDue = new Date()
    nextDue.setDate(nextDue.getDate() + frequency)

    onAddReminder({
      plantId,
      type: type as Reminder["type"],
      frequency,
      nextDue: nextDue.toISOString(),
      customName: customName.trim() || undefined,
    })

    // Reset form
    setType("")
    setFrequency(7)
    setCustomName("")
    onOpenChange(false)
  }

  const selectedReminderType = reminderTypes.find((rt) => rt.value === type)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Reminder</DialogTitle>
          <DialogDescription>Set up a care reminder for {plantName}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Reminder Type *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select reminder type" />
              </SelectTrigger>
              <SelectContent>
                {reminderTypes.map((reminderType) => {
                  const Icon = reminderType.icon
                  return (
                    <SelectItem key={reminderType.value} value={reminderType.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {reminderType.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency *</Label>
            <Select value={frequency.toString()} onValueChange={(value) => setFrequency(Number.parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {frequencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === "other" && (
            <div className="space-y-2">
              <Label htmlFor="customName">Custom Name</Label>
              <Input
                id="customName"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g., Check for pests"
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Reminder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
