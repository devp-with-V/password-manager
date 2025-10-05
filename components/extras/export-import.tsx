"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Download, Upload, FileJson, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { encrypt, decrypt } from "@/lib/crypto"
import type { DecryptedVaultItem } from "@/types/vault"

interface ExportImportProps {
  vaultItems: DecryptedVaultItem[]
  encryptionKey: CryptoKey
  onImport: (items: DecryptedVaultItem[]) => void
}

export function ExportImport({ vaultItems, encryptionKey, onImport }: ExportImportProps) {
  const [exportPassword, setExportPassword] = useState("")
  const [importPassword, setImportPassword] = useState("")
  const [importFile, setImportFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleExport = async () => {
    if (!exportPassword) {
      toast({
        title: "Password required",
        description: "Please enter a password to encrypt the export file",
        variant: "destructive",
      })
      return
    }

    try {
      // Create export data
      const exportData = {
        version: "1.0",
        exported: new Date().toISOString(),
        items: vaultItems,
      }

      // Encrypt the export with the provided password
      const jsonString = JSON.stringify(exportData)
      const encrypted = await encrypt(jsonString, encryptionKey)

      // Create download
      const blob = new Blob([JSON.stringify(encrypted)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `securevault-backup-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      setExportPassword("")
      toast({
        title: "Export successful",
        description: "Your vault has been exported and encrypted",
      })
    } catch (error) {
      console.error("[v0] Export error:", error)
      toast({
        title: "Export failed",
        description: "Failed to export vault data",
        variant: "destructive",
      })
    }
  }

  const handleImport = async () => {
    if (!importFile || !importPassword) {
      toast({
        title: "Missing information",
        description: "Please select a file and enter the password",
        variant: "destructive",
      })
      return
    }

    try {
      const fileContent = await importFile.text()
      const encryptedData = JSON.parse(fileContent)

      // Decrypt the import
      const decryptedString = await decrypt(encryptedData.encrypted, encryptedData.iv, encryptionKey)
      const importData = JSON.parse(decryptedString)

      // Validate structure
      if (!importData.items || !Array.isArray(importData.items)) {
        throw new Error("Invalid file format")
      }

      onImport(importData.items)
      setImportFile(null)
      setImportPassword("")

      toast({
        title: "Import successful",
        description: `Imported ${importData.items.length} entries`,
      })
    } catch (error) {
      console.error("[v0] Import error:", error)
      toast({
        title: "Import failed",
        description: "Failed to decrypt or parse the file. Check your password.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FileJson className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Export / Import</h3>
        </div>
        <p className="text-sm text-muted-foreground">Backup and restore your vault with encrypted files</p>
      </div>

      <div className="space-y-6">
        {/* Export Section */}
        <div className="space-y-4 p-4 bg-secondary/30 rounded-lg border border-border/50">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" />
            <h4 className="font-semibold">Export Vault</h4>
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="export-password">Encryption Password</Label>
              <Input
                id="export-password"
                type="password"
                placeholder="Enter password for export file"
                value={exportPassword}
                onChange={(e) => setExportPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">This password will be required to import the file</p>
            </div>
            <Button onClick={handleExport} className="w-full" disabled={vaultItems.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export {vaultItems.length} Entries
            </Button>
          </div>
        </div>

        {/* Import Section */}
        <div className="space-y-4 p-4 bg-secondary/30 rounded-lg border border-border/50">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            <h4 className="font-semibold">Import Vault</h4>
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="import-file">Select Backup File</Label>
              <Input
                id="import-file"
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="import-password">Decryption Password</Label>
              <Input
                id="import-password"
                type="password"
                placeholder="Enter the export password"
                value={importPassword}
                onChange={(e) => setImportPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleImport} className="w-full" variant="secondary">
              <Upload className="h-4 w-4 mr-2" />
              Import Vault
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            All exports are encrypted with your chosen password. Keep this password safe - it cannot be recovered if
            lost.
          </p>
        </div>
      </div>
    </Card>
  )
}
