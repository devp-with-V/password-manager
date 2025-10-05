"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tag, Plus, X, Folder } from "lucide-react"

interface TagsManagerProps {
  availableTags: string[]
  onTagsChange: (tags: string[]) => void
}

export function TagsManager({ availableTags, onTagsChange }: TagsManagerProps) {
  const [newTag, setNewTag] = useState("")
  const [tags, setTags] = useState<string[]>(availableTags)

  const handleAddTag = () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) return

    const updatedTags = [...tags, newTag.trim()]
    setTags(updatedTags)
    onTagsChange(updatedTags)
    setNewTag("")
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove)
    setTags(updatedTags)
    onTagsChange(updatedTags)
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Tags & Folders</h3>
        </div>
        <p className="text-sm text-muted-foreground">Organize your vault entries with tags and folders</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-tag">Add New Tag</Label>
          <div className="flex gap-2">
            <Input
              id="new-tag"
              type="text"
              placeholder="e.g., Work, Personal, Banking"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
            />
            <Button onClick={handleAddTag} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="space-y-2">
            <Label>Your Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                  <Folder className="h-3 w-3" />
                  {tag}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 bg-secondary/30 rounded-lg border border-border/50">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Tags will be available when adding or editing vault entries. This feature helps you
            organize and filter your passwords by category.
          </p>
        </div>
      </div>
    </Card>
  )
}
