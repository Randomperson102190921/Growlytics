"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera } from "lucide-react"
import type { Plant } from "@/app/page"

interface AddPlantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddPlant: (plant: Omit<Plant, "id" | "dateAdded">) => void
}

const plantTypes = [
  "Houseplant",
  "Succulent",
  "Herb",
  "Vegetable",
  "Flower",
  "Tree",
  "Shrub",
  "Fern",
  "Cactus",
  "Other",
]

export function AddPlantDialog({ open, onOpenChange, onAddPlant }: AddPlantDialogProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [notes, setNotes] = useState("")
  const [photo, setPhoto] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onAddPlant({
      name: name.trim(),
      type: type || "Houseplant",
      notes: notes.trim() || undefined,
      photo: photo || undefined,
    })

    // Reset form
    setName("")
    setType("")
    setNotes("")
    setPhoto("")
    onOpenChange(false)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhoto(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Plant</DialogTitle>
          <DialogDescription>Add a new plant to start tracking its care schedule.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Plant Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Monstera"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Plant Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select plant type" />
              </SelectTrigger>
              <SelectContent>
                {plantTypes.map((plantType) => (
                  <SelectItem key={plantType} value={plantType}>
                    {plantType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Photo</Label>
            <div className="flex items-center gap-2">
              <Input id="photo" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("photo")?.click()}
                className="flex-1 gap-2"
              >
                <Camera className="w-4 h-4" />
                {photo ? "Change Photo" : "Add Photo"}
              </Button>
            </div>
            {photo && (
              <div className="mt-2">
                <img
                  src={photo || "/placeholder.svg"}
                  alt="Plant preview"
                  className="w-full h-32 object-cover rounded-lg border border-border"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special care instructions or notes..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Plant
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
