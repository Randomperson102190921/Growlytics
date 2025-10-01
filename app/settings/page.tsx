"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Settings, User, Bell, Database, Trash2, Download, Upload, Eye, EyeOff, Palette } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { useTheme } from "next-themes"
import { useAuth } from "@/lib/auth-context"
import {
  saveSettings,
  getSettings,
  subscribeToSettings,
  getPlants,
  getReminders,
  getTasks,
  saveUserData,
  deletePlant,
  type UserSettings
} from "@/lib/database"


export default function SettingsPage() {
  const { user } = useAuth()
  const { setTheme } = useTheme()
  const [userSettings, setUserSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      push: true,
      reminders: true,
    },
    preferences: {
      theme: "system",
      defaultReminderFrequency: 7,
      showCompletedTasks: true,
    },
  })
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const { toast } = useToast()

  // Check authentication and load settings
  useEffect(() => {
    if (!user?.uid) {
      router.push("/auth/signup")
      return
    }

    setProfileData({
      name: user.displayName || "",
      email: user.email || "",
    })

    // Subscribe to user settings
    const unsubscribe = subscribeToSettings(user.uid, (settings) => {
      if (settings) {
        setUserSettings(settings)
        setTheme(settings.preferences.theme)
      }
    })

    return unsubscribe
  }, [user, router, setTheme])

  // Save settings to Firebase
  const handleSaveSettings = async (newSettings: UserSettings) => {
    if (!user?.uid) return

    try {
      await saveSettings(user.uid, newSettings)
      setUserSettings(newSettings)
      setTheme(newSettings.preferences.theme)
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Update profile
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      // For Firebase Auth, we can only update display name and email
      // Password changes require re-authentication and are handled separately
      if (profileData.name !== user.displayName) {
        await user.updateProfile({ displayName: profileData.name })
      }

      if (profileData.email !== user.email) {
        await user.updateEmail(profileData.email)
      }

      // Profile updated successfully

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error: any) {
      let errorMessage = "Failed to update profile. Please try again."

      if (error.code === 'auth/requires-recent-login') {
        errorMessage = "Please log out and log back in to update your email."
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already in use by another account."
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Export data
  const handleExportData = async () => {
    if (!user?.uid) return

    try {
      const [plants, reminders, tasks] = await Promise.all([
        getPlants(user.uid),
        getReminders(user.uid),
        getTasks(user.uid),
      ])

      const exportData = {
        user: { name: user.displayName || "", email: user.email || "" },
        plants,
        reminders,
        tasks,
        settings: userSettings,
        exportDate: new Date().toISOString(),
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)

      const link = document.createElement("a")
      link.href = url
      link.download = `growlytics-data-${format(new Date(), "yyyy-MM-dd")}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Data exported",
        description: "Your data has been downloaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Import data
  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user?.uid) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string)

        // Validate data structure
        if (!importData.plants || !importData.reminders || !importData.tasks) {
          throw new Error("Invalid data format")
        }

        // Import data to Firebase
        await saveUserData(user.uid, {
          plants: importData.plants,
          reminders: importData.reminders,
          tasks: importData.tasks,
        })

        if (importData.settings) {
          await saveSettings(user.uid, importData.settings)
          setUserSettings(importData.settings)
        }

        toast({
          title: "Data imported",
          description: "Your data has been imported successfully.",
        })

        // Refresh the page to load new data
        window.location.reload()
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Failed to import data. Please check the file format.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  // Delete all data
  const handleDeleteAllData = async () => {
    if (!user?.uid) return

    try {
      // Delete all plants, reminders, and tasks from Firebase
      const [plants, reminders, tasks] = await Promise.all([
        getPlants(user.uid),
        getReminders(user.uid),
        getTasks(user.uid),
      ])

      // Delete each plant (this will cascade to related data via Firebase rules)
      await Promise.all(plants.map(plant => deletePlant(user.uid, plant.id)))

      toast({
        title: "Data deleted",
        description: "All your plant data has been deleted.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete data. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Delete account
  const handleDeleteAccount = async () => {
    if (!user) return

    try {
      // Delete all user data first
      await handleDeleteAllData()

      // Delete the user account
      await user.delete()

      toast({
        title: "Account deleted",
        description: "Your account and all data have been deleted.",
      })

      // Redirect to signup
      router.push("/auth/signup")
    } catch (error: any) {
      let errorMessage = "Failed to delete account. Please try again."

      if (error.code === 'auth/requires-recent-login') {
        errorMessage = "Please log out and log back in to delete your account."
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                  <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
                </div>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-8">
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile
                  </CardTitle>
                  <CardDescription>Update your personal information and password</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                          className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                          className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                      </div>
                    </div>


                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Updating..." : "Update Profile"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </CardTitle>
                  <CardDescription>Configure how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive care reminders via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={userSettings.notifications.email}
                      onCheckedChange={(checked) =>
                        handleSaveSettings({
                          ...userSettings,
                          notifications: { ...userSettings.notifications, email: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={userSettings.notifications.push}
                      onCheckedChange={(checked) =>
                        handleSaveSettings({
                          ...userSettings,
                          notifications: { ...userSettings.notifications, push: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="reminder-notifications">Task Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get notified about upcoming tasks</p>
                    </div>
                    <Switch
                      id="reminder-notifications"
                      checked={userSettings.notifications.reminders}
                      onCheckedChange={(checked) =>
                        handleSaveSettings({
                          ...userSettings,
                          notifications: { ...userSettings.notifications, reminders: checked },
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Preferences
                  </CardTitle>
                  <CardDescription>Customize your app experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="theme-select">Theme</Label>
                      <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
                    </div>
                    <Select
                      value={userSettings.preferences.theme}
                      onValueChange={(value: "light" | "dark" | "system") =>
                        handleSaveSettings({
                          ...userSettings,
                          preferences: { ...userSettings.preferences, theme: value },
                        })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-completed">Show Completed Tasks</Label>
                      <p className="text-sm text-muted-foreground">Display completed care tasks in your dashboard</p>
                    </div>
                    <Switch
                      id="show-completed"
                      checked={userSettings.preferences.showCompletedTasks}
                      onCheckedChange={(checked) =>
                        handleSaveSettings({
                          ...userSettings,
                          preferences: { ...userSettings.preferences, showCompletedTasks: checked },
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Data Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Data Management
                  </CardTitle>
                  <CardDescription>Export, import, or delete your plant data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={handleExportData} variant="outline" className="gap-2 bg-transparent">
                      <Download className="w-4 h-4" />
                      Export Data
                    </Button>

                    <div>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportData}
                        className="hidden"
                        id="import-data"
                      />
                      <Button asChild variant="outline" className="gap-2 bg-transparent">
                        <label htmlFor="import-data" className="cursor-pointer">
                          <Upload className="w-4 h-4" />
                          Import Data
                        </label>
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="gap-2">
                            <Trash2 className="w-4 h-4" />
                            Delete All Data
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete All Plant Data</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete all your plants, reminders, and tasks. This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteAllData} className="bg-destructive">
                              Delete All Data
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="gap-2">
                            <Trash2 className="w-4 h-4" />
                            Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Account</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete your account and all associated data. This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive">
                              Delete Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* App Info */}
              <Card>
                <CardHeader>
                  <CardTitle>About Growlytics</CardTitle>
                  <CardDescription>Application information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version</span>
                      <Badge variant="secondary">1.0.0</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account Created</span>
                      <span className="text-sm">{format(new Date(user.createdAt), "MMM dd, yyyy")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
