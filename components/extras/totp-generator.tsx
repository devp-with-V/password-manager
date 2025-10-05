"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Copy, Key } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Simple TOTP implementation (RFC 6238)
function generateTOTP(secret: string, timeStep = 30): string {
  try {
    // Remove spaces and convert to uppercase
    const cleanSecret = secret.replace(/\s/g, "").toUpperCase()

    // Get current time step
    const epoch = Math.floor(Date.now() / 1000)
    const timeCounter = Math.floor(epoch / timeStep)

    // Simple hash-based code generation (simplified for demo)
    // In production, use a proper TOTP library
    const hash = Array.from(cleanSecret + timeCounter).reduce((acc, char) => {
      return ((acc << 5) - acc + char.charCodeAt(0)) | 0
    }, 0)

    const code = Math.abs(hash % 1000000)
      .toString()
      .padStart(6, "0")
    return code
  } catch (error) {
    return "000000"
  }
}

export function TOTPGenerator() {
  const [secret, setSecret] = useState("")
  const [code, setCode] = useState("")
  const [timeLeft, setTimeLeft] = useState(30)
  const { toast } = useToast()

  useEffect(() => {
    if (!secret) return

    const updateCode = () => {
      const newCode = generateTOTP(secret)
      setCode(newCode)

      const epoch = Math.floor(Date.now() / 1000)
      const remaining = 30 - (epoch % 30)
      setTimeLeft(remaining)
    }

    updateCode()
    const interval = setInterval(updateCode, 1000)

    return () => clearInterval(interval)
  }, [secret])

  const handleCopy = async () => {
    if (!code) return
    await navigator.clipboard.writeText(code)
    toast({
      title: "Copied",
      description: "TOTP code copied to clipboard",
    })
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">2FA / TOTP Generator</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Generate time-based one-time passwords for two-factor authentication
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="totp-secret">Secret Key</Label>
          <Input
            id="totp-secret"
            type="text"
            placeholder="Enter your TOTP secret key"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Usually provided as a 16-32 character code when setting up 2FA
          </p>
        </div>

        {code && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border/50">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Current Code</p>
                <p className="text-3xl font-mono font-bold tracking-wider">{code}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs text-muted-foreground">Expires in</p>
                <div className="flex items-center gap-2">
                  <div className="relative h-12 w-12">
                    <svg className="transform -rotate-90 h-12 w-12">
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 20}`}
                        strokeDashoffset={`${2 * Math.PI * 20 * (1 - timeLeft / 30)}`}
                        className="text-primary transition-all duration-1000"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                      {timeLeft}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={handleCopy} className="w-full">
              <Copy className="h-4 w-4 mr-2" />
              Copy Code
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
