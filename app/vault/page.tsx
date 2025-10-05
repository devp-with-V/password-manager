"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { VaultItemCard } from "@/components/vault/vault-item-card"
import { VaultItemForm } from "@/components/vault/vault-item-form"
import { PasswordGenerator } from "@/components/password-generator"
import { TOTPGenerator } from "@/components/extras/totp-generator"
import { TagsManager } from "@/components/extras/tags-manager"
import { ThemeToggle } from "@/components/extras/theme-toggle"
import { ExportImport } from "@/components/extras/export-import"
import { useEncryptionKey } from "@/hooks/use-encryption-key"
import { encrypt, decrypt } from "@/lib/crypto"
import { Plus, Search, LogOut, Shield, Loader2, Settings } from "lucide-react"
import type { VaultItem, DecryptedVaultItem } from "@/types/vault"
import { useToast } from "@/hooks/use-toast"

export default function VaultPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { encryptionKey, isLoading: isKeyLoading } = useEncryptionKey()
  const [vaultItems, setVaultItems] = useState<DecryptedVaultItem[]>([])
  const [filteredItems, setFilteredItems] = useState<DecryptedVaultItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<DecryptedVaultItem | undefined>()
  const [showGenerator, setShowGenerator] = useState(false)
  const [prefilledPassword, setPrefilledPassword] = useState("")
  const [showExtras, setShowExtras] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    const loadVaultItems = async () => {
      if (!encryptionKey || !session?.user?.id) {
        console.log("[v0] Cannot load vault - encryptionKey:", !!encryptionKey, "session:", !!session?.user?.id)
        setIsLoading(false)
        return
      }

      try {
        console.log("[v0] Fetching vault items from API...")
        const response = await fetch("/api/vault")
        if (!response.ok) throw new Error("Failed to load vault items")

        const encryptedItems: VaultItem[] = await response.json()
        console.log("[v0] Received encrypted items:", encryptedItems.length)

        const decrypted = await Promise.all(
          encryptedItems.map(async (item) => {
            try {
              return {
                _id: item._id,
                title: await decrypt(item.encryptedTitle, item.ivTitle, encryptionKey),
                username: await decrypt(item.encryptedUsername, item.ivUsername, encryptionKey),
                password: await decrypt(item.encryptedPassword, item.ivPassword, encryptionKey),
                url: await decrypt(item.encryptedUrl, item.ivUrl, encryptionKey),
                notes: await decrypt(item.encryptedNotes, item.ivNotes, encryptionKey),
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
              }
            } catch (error) {
              console.error("[v0] Failed to decrypt item:", error)
              return null
            }
          }),
        )

        const validItems = decrypted.filter((item): item is DecryptedVaultItem => item !== null)
        console.log("[v0] Successfully decrypted items:", validItems.length)
        setVaultItems(validItems)
        setFilteredItems(validItems)
      } catch (error) {
        console.error("[v0] Failed to load vault:", error)
        toast({
          title: "Failed to load vault",
          description: "Please try refreshing the page",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (!isKeyLoading) {
      loadVaultItems()
    }
  }, [encryptionKey, session, isKeyLoading, toast])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(vaultItems)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = vaultItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.username.toLowerCase().includes(query) ||
        item.url.toLowerCase().includes(query),
    )
    setFilteredItems(filtered)
  }, [searchQuery, vaultItems])

  const handleSaveItem = async (itemData: Omit<DecryptedVaultItem, "_id" | "createdAt" | "updatedAt">) => {
    if (!encryptionKey) {
      toast({
        title: "Encryption key not available",
        description: "Please refresh the page and try again",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("[v0] Encrypting vault item...")
      const encryptedTitle = await encrypt(itemData.title, encryptionKey)
      const encryptedUsername = await encrypt(itemData.username, encryptionKey)
      const encryptedPassword = await encrypt(itemData.password, encryptionKey)
      const encryptedUrl = await encrypt(itemData.url, encryptionKey)
      const encryptedNotes = await encrypt(itemData.notes, encryptionKey)

      const encryptedItem = {
        encryptedTitle: encryptedTitle.encrypted,
        ivTitle: encryptedTitle.iv,
        encryptedUsername: encryptedUsername.encrypted,
        ivUsername: encryptedUsername.iv,
        encryptedPassword: encryptedPassword.encrypted,
        ivPassword: encryptedPassword.iv,
        encryptedUrl: encryptedUrl.encrypted,
        ivUrl: encryptedUrl.iv,
        encryptedNotes: encryptedNotes.encrypted,
        ivNotes: encryptedNotes.iv,
      }

      const url = editingItem?._id ? `/api/vault/${editingItem._id}` : "/api/vault"
      const method = editingItem?._id ? "PUT" : "POST"

      console.log("[v0] Sending encrypted item to API:", method, url)
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(encryptedItem),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] API error:", errorData)
        throw new Error("Failed to save item")
      }

      const savedItem: VaultItem = await response.json()
      console.log("[v0] Item saved successfully:", savedItem._id)

      const decryptedItem: DecryptedVaultItem = {
        _id: savedItem._id,
        title: itemData.title,
        username: itemData.username,
        password: itemData.password,
        url: itemData.url,
        notes: itemData.notes,
        createdAt: savedItem.createdAt,
        updatedAt: savedItem.updatedAt,
      }

      if (editingItem?._id) {
        setVaultItems(vaultItems.map((item) => (item._id === editingItem._id ? decryptedItem : item)))
      } else {
        setVaultItems([decryptedItem, ...vaultItems])
      }

      setShowForm(false)
      setEditingItem(undefined)
      setShowGenerator(false)
      setPrefilledPassword("")

      toast({
        title: editingItem ? "Entry updated" : "Entry saved",
        description: "Your vault has been updated",
      })
    } catch (error) {
      console.error("[v0] Failed to save item:", error)
      toast({
        title: "Failed to save",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return

    try {
      const response = await fetch(`/api/vault/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete item")

      setVaultItems(vaultItems.filter((item) => item._id !== id))
      toast({
        title: "Entry deleted",
        description: "The entry has been removed from your vault",
      })
    } catch (error) {
      console.error("[v0] Failed to delete item:", error)
      toast({
        title: "Failed to delete",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const handleSaveToVaultChange = (shouldSave: boolean, password: string) => {
    if (shouldSave) {
      setPrefilledPassword(password)
      setShowForm(true)
    } else {
      setPrefilledPassword("")
      setShowForm(false)
    }
  }

  const handleImportItems = async (items: DecryptedVaultItem[]) => {
    if (!encryptionKey) return

    try {
      for (const item of items) {
        const encryptedTitle = await encrypt(item.title, encryptionKey)
        const encryptedUsername = await encrypt(item.username, encryptionKey)
        const encryptedPassword = await encrypt(item.password, encryptionKey)
        const encryptedUrl = await encrypt(item.url, encryptionKey)
        const encryptedNotes = await encrypt(item.notes, encryptionKey)

        const encryptedItem = {
          encryptedTitle: encryptedTitle.encrypted,
          ivTitle: encryptedTitle.iv,
          encryptedUsername: encryptedUsername.encrypted,
          ivUsername: encryptedUsername.iv,
          encryptedPassword: encryptedPassword.encrypted,
          ivPassword: encryptedPassword.iv,
          encryptedUrl: encryptedUrl.encrypted,
          ivUrl: encryptedUrl.iv,
          encryptedNotes: encryptedNotes.encrypted,
          ivNotes: encryptedNotes.iv,
        }

        await fetch("/api/vault", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(encryptedItem),
        })
      }

      // Reload vault items
      const response = await fetch("/api/vault")
      const encryptedItems: VaultItem[] = await response.json()
      const decrypted = await Promise.all(
        encryptedItems.map(async (item) => ({
          _id: item._id,
          title: await decrypt(item.encryptedTitle, item.ivTitle, encryptionKey),
          username: await decrypt(item.encryptedUsername, item.ivUsername, encryptionKey),
          password: await decrypt(item.encryptedPassword, item.ivPassword, encryptionKey),
          url: await decrypt(item.encryptedUrl, item.ivUrl, encryptionKey),
          notes: await decrypt(item.encryptedNotes, item.ivNotes, encryptionKey),
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
      )

      setVaultItems(decrypted)
      setFilteredItems(decrypted)
    } catch (error) {
      console.error("[v0] Import error:", error)
    }
  }

  const handleLogout = async () => {
    localStorage.removeItem("_salt")
    sessionStorage.removeItem("_temp_pwd")
    await signOut({ callbackUrl: "/auth/signin" })
  }

  if (status === "loading" || isKeyLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!encryptionKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-semibold">Encryption Key Not Available</h2>
          <p className="text-muted-foreground">Please sign in again to access your vault</p>
          <Button onClick={() => router.push("/auth/signin")}>Sign In</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">SecureVault</h1>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showExtras ? "default" : "outline"}
                onClick={() => {
                  setShowExtras(!showExtras)
                  setShowForm(false)
                  setShowGenerator(false)
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Extras
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showExtras ? (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Extra Features</h2>
              <Button variant="outline" onClick={() => setShowExtras(false)}>
                Back to Vault
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <TOTPGenerator />
              <ThemeToggle />
              <TagsManager availableTags={tags} onTagsChange={setTags} />
              <ExportImport vaultItems={vaultItems} encryptionKey={encryptionKey} onImport={handleImportItems} />
            </div>
          </div>
        ) : showGenerator && !showForm ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Generate Password</h2>
              <Button variant="outline" onClick={() => setShowGenerator(false)}>
                Back to Vault
              </Button>
            </div>
            <PasswordGenerator showSaveToVault={true} onSaveToVaultChange={handleSaveToVaultChange} />
          </div>
        ) : showForm ? (
          <div className="max-w-2xl mx-auto">
            <VaultItemForm
              item={editingItem || (prefilledPassword ? ({ password: prefilledPassword } as any) : undefined)}
              onSubmit={handleSaveItem}
              onCancel={() => {
                setShowForm(false)
                setEditingItem(undefined)
                setPrefilledPassword("")
                if (showGenerator) {
                  // Stay on generator if we came from there
                } else {
                  setShowGenerator(false)
                }
              }}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or URL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary/50"
                />
              </div>
              <Button variant="outline" onClick={() => setShowGenerator(true)}>
                Generate Password
              </Button>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? "No results found" : "Your vault is empty"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "Try a different search term" : "Add your first password to get started"}
                </p>
                {!searchQuery && (
                  <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => setShowGenerator(true)}>
                      Generate Password
                    </Button>
                    <Button onClick={() => setShowForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Entry
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => (
                  <VaultItemCard
                    key={item._id}
                    item={item}
                    onEdit={(item) => {
                      setEditingItem(item)
                      setShowForm(true)
                    }}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
