"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PasswordGenerator } from "@/components/password-generator"
import type { DecryptedVaultItem } from "@/types/vault"

interface VaultItemFormProps {
  item?: DecryptedVaultItem
  onSubmit: (item: Omit<DecryptedVaultItem, "_id" | "createdAt" | "updatedAt">) => Promise<void>
  onCancel: () => void
}

export function VaultItemForm({ item, onSubmit, onCancel }: VaultItemFormProps) {
  const [formData, setFormData] = useState({
    title: item?.title || "",
    username: item?.username || "",
    password: item?.password || "",
    url: item?.url || "",
    notes: item?.notes || "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordGenerated = (password: string) => {
    setFormData({ ...formData, password })
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>{item ? "Edit Entry" : "New Vault Entry"}</CardTitle>
        <CardDescription>All data is encrypted before being saved</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="generator">Generator</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Gmail Account"
                  required
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username / Email</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="user@example.com"
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="bg-secondary/50 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional information..."
                  rows={4}
                  className="bg-secondary/50 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Saving..." : item ? "Update Entry" : "Save Entry"}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="generator" className="mt-4">
            <PasswordGenerator onPasswordGenerated={handlePasswordGenerated} />
            <p className="text-sm text-muted-foreground mt-4">
              Generated password will be automatically filled in the password field
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
