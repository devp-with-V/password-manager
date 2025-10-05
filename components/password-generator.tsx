"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Copy, RefreshCw, Check } from "lucide-react"
import { generatePassword, calculatePasswordStrength, type PasswordOptions } from "@/lib/password-generator"
import { useToast } from "@/hooks/use-toast"

interface PasswordGeneratorProps {
  onPasswordGenerated?: (password: string) => void
  onSaveToVaultChange?: (shouldSave: boolean, password: string) => void
  showSaveToVault?: boolean
}

export function PasswordGenerator({
  onPasswordGenerated,
  onSaveToVaultChange,
  showSaveToVault = false,
}: PasswordGeneratorProps) {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: false,
  })
  const [password, setPassword] = useState("")
  const [copied, setCopied] = useState(false)
  const [clearTimer, setClearTimer] = useState<NodeJS.Timeout | null>(null)
  const [saveToVault, setSaveToVault] = useState(false)
  const { toast } = useToast()

  const onPasswordGeneratedRef = useRef(onPasswordGenerated)
  const onSaveToVaultChangeRef = useRef(onSaveToVaultChange)

  useEffect(() => {
    onPasswordGeneratedRef.current = onPasswordGenerated
    onSaveToVaultChangeRef.current = onSaveToVaultChange
  }, [onPasswordGenerated, onSaveToVaultChange])

  // Generate password on mount and when options change
  useEffect(() => {
    try {
      const newPassword = generatePassword(options)
      setPassword(newPassword)
      onPasswordGeneratedRef.current?.(newPassword)
      if (saveToVault) {
        onSaveToVaultChangeRef.current?.(true, newPassword)
      }
    } catch (error) {
      console.error("[v0] Password generation error:", error)
    }
  }, [options, saveToVault])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      toast({
        title: "Copied to clipboard",
        description: "Password will be cleared in 15 seconds",
      })

      // Clear any existing timer
      if (clearTimer) {
        clearTimeout(clearTimer)
      }

      // Set new timer to clear password after 15 seconds
      const timer = setTimeout(() => {
        setPassword("")
        toast({
          title: "Password cleared",
          description: "For your security, the password has been cleared",
        })
      }, 15000)

      setClearTimer(timer)

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const handleRegenerate = () => {
    try {
      const newPassword = generatePassword(options)
      setPassword(newPassword)
      onPasswordGeneratedRef.current?.(newPassword)
      if (saveToVault) {
        onSaveToVaultChangeRef.current?.(true, newPassword)
      }
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Please select at least one character type",
        variant: "destructive",
      })
    }
  }

  const handleSaveToVaultToggle = (checked: boolean) => {
    setSaveToVault(checked)
    onSaveToVaultChangeRef.current?.(checked, password)
  }

  const strength = password ? calculatePasswordStrength(password) : null

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Password Generator</CardTitle>
        <CardDescription>Generate strong, random passwords instantly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generated Password Display */}
        <div className="space-y-2">
          <Label>Generated Password</Label>
          <div className="flex gap-2">
            <Input
              value={password}
              readOnly
              className="font-mono text-lg bg-secondary/50"
              placeholder="Generate a password"
            />
            <Button size="icon" variant="outline" onClick={handleCopy} disabled={!password}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="outline" onClick={handleRegenerate}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          {strength && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Strength:</span>
              <span className={strength.color}>{strength.label}</span>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    strength.score >= 80
                      ? "bg-green-500"
                      : strength.score >= 60
                        ? "bg-yellow-500"
                        : strength.score >= 40
                          ? "bg-orange-500"
                          : "bg-destructive"
                  }`}
                  style={{ width: `${strength.score}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Length Slider */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Length</Label>
            <span className="text-sm text-muted-foreground">{options.length}</span>
          </div>
          <Slider
            value={[options.length]}
            onValueChange={([value]) => setOptions({ ...options, length: value })}
            min={8}
            max={64}
            step={1}
            className="w-full"
          />
        </div>

        {/* Character Type Toggles */}
        <div className="space-y-3">
          <Label>Character Types</Label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="uppercase" className="font-normal cursor-pointer">
                Include Uppercase (A-Z)
              </Label>
              <Switch
                id="uppercase"
                checked={options.includeUppercase}
                onCheckedChange={(checked) => setOptions({ ...options, includeUppercase: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="lowercase" className="font-normal cursor-pointer">
                Include Lowercase (a-z)
              </Label>
              <Switch
                id="lowercase"
                checked={options.includeLowercase}
                onCheckedChange={(checked) => setOptions({ ...options, includeLowercase: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="numbers" className="font-normal cursor-pointer">
                Include Numbers (0-9)
              </Label>
              <Switch
                id="numbers"
                checked={options.includeNumbers}
                onCheckedChange={(checked) => setOptions({ ...options, includeNumbers: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="symbols" className="font-normal cursor-pointer">
                Include Symbols (!@#$...)
              </Label>
              <Switch
                id="symbols"
                checked={options.includeSymbols}
                onCheckedChange={(checked) => setOptions({ ...options, includeSymbols: checked })}
              />
            </div>
          </div>
        </div>

        {/* Exclude Ambiguous */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="space-y-0.5">
            <Label htmlFor="ambiguous" className="font-normal cursor-pointer">
              Exclude Ambiguous Characters
            </Label>
            <p className="text-xs text-muted-foreground">Excludes: i, l, 1, L, o, 0, O</p>
          </div>
          <Switch
            id="ambiguous"
            checked={options.excludeAmbiguous}
            onCheckedChange={(checked) => setOptions({ ...options, excludeAmbiguous: checked })}
          />
        </div>

        {showSaveToVault && (
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="space-y-0.5">
              <Label htmlFor="saveToVault" className="font-normal cursor-pointer">
                Save to vault?
              </Label>
              <p className="text-xs text-muted-foreground">Auto-fill this password in a new vault entry</p>
            </div>
            <Switch id="saveToVault" checked={saveToVault} onCheckedChange={handleSaveToVaultToggle} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
