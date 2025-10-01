"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, BarChart3, Settings } from "lucide-react"

interface QuickActionsProps {
  onAddPlant: () => void
}

export function QuickActions({ onAddPlant }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={onAddPlant} className="gap-2 h-auto py-3 flex-col">
            <Plus className="w-5 h-5" />
            <span className="text-sm">Add Plant</span>
          </Button>
          <Button variant="outline" className="gap-2 h-auto py-3 flex-col bg-transparent">
            <Calendar className="w-5 h-5" />
            <span className="text-sm leading-7 text-justify">{"Calendar"}</span>
          </Button>
          <Button variant="outline" className="gap-2 h-auto py-3 flex-col bg-transparent">
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm">Analytics</span>
          </Button>
          <Button variant="outline" className="gap-2 h-auto py-3 flex-col bg-transparent">
            <Settings className="w-5 h-5" />
            <span className="text-sm">Settings</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
