"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Moon, Sun, Monitor } from "lucide-react"

type Theme = "light" | "dark" | "system"

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system")

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme
    if (stored) {
      setTheme(stored)
      applyTheme(stored)
    }
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement

    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.toggle("dark", systemTheme === "dark")
    } else {
      root.classList.toggle("dark", newTheme === "dark")
    }
  }

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    applyTheme(newTheme)
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Moon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Dark Mode</h3>
        </div>
        <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
      </div>

      <div className="space-y-3">
        <Label>Theme Preference</Label>
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            onClick={() => handleThemeChange("light")}
            className="flex flex-col gap-2 h-auto py-4"
          >
            <Sun className="h-5 w-5" />
            <span className="text-xs">Light</span>
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            onClick={() => handleThemeChange("dark")}
            className="flex flex-col gap-2 h-auto py-4"
          >
            <Moon className="h-5 w-5" />
            <span className="text-xs">Dark</span>
          </Button>
          <Button
            variant={theme === "system" ? "default" : "outline"}
            onClick={() => handleThemeChange("system")}
            className="flex flex-col gap-2 h-auto py-4"
          >
            <Monitor className="h-5 w-5" />
            <span className="text-xs">System</span>
          </Button>
        </div>
      </div>
    </Card>
  )
}
