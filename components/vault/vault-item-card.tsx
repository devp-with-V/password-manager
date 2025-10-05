"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Eye, EyeOff, ExternalLink, Pencil, Trash2, Check } from "lucide-react"
import type { DecryptedVaultItem } from "@/types/vault"
import { useToast } from "@/hooks/use-toast"

interface VaultItemCardProps {
  item: DecryptedVaultItem
  onEdit: (item: DecryptedVaultItem) => void
  onDelete: (id: string) => void
}

export function VaultItemCard({ item, onEdit, onDelete }: VaultItemCardProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const { toast } = useToast()

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast({
        title: "Copied to clipboard",
        description: `${field} copied successfully`,
      })
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="border-border/50 hover:border-border transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{item.title}</CardTitle>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 w-fit"
              >
                {new URL(item.url).hostname}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={() => onEdit(item)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => item._id && onDelete(item._id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {item.username && (
          <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-secondary/50">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Username</p>
              <p className="text-sm font-mono truncate">{item.username}</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="shrink-0"
              onClick={() => handleCopy(item.username, "Username")}
            >
              {copiedField === "Username" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        )}

        {item.password && (
          <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-secondary/50">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Password</p>
              <p className="text-sm font-mono truncate">{showPassword ? item.password : "••••••••••••"}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleCopy(item.password, "Password")}>
                {copiedField === "Password" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        {item.notes && (
          <div className="p-2 rounded-md bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Notes</p>
            <p className="text-sm whitespace-pre-wrap">{item.notes}</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground pt-2">Added {new Date(item.createdAt).toLocaleDateString()}</p>
      </CardContent>
    </Card>
  )
}
