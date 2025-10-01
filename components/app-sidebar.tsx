"use client"

import { Calendar, ChartBar as BarChart3, Settings, Chrome as Home, LogOut, Leaf } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/auth/signup")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (!user) return null

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-4">
          <div>
            <h2 className="font-bold text-foreground">Growlytics</h2>
            <p className="text-xs text-muted-foreground">Plant Care</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-xs font-bold text-muted-foreground">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} onClick={() => router.push(item.url)}>
                    <button className={`flex items-center gap-3 w-full mx-2 px-3 py-3 rounded-lg transition-all touch-target ${pathname === item.url ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-accent"}`}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 border-t border-border">
          <div className="mb-3 p-3 bg-secondary rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary text-sm font-bold rounded-full">
                {getInitials(user.displayName || user.email || "U")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{user.displayName || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="app-button-secondary w-full touch-target">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
