"use client"

import { useState, useEffect } from "react"
import { deriveKey, generateSalt, uint8ArrayToBase64, base64ToUint8Array } from "@/lib/crypto"

export function useEncryptionKey() {
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeKey = async () => {
      try {
        // Keep password in sessionStorage for the entire session
        const password = sessionStorage.getItem("_temp_pwd")

        if (!password) {
          console.error("[v0] No password found in sessionStorage")
          setIsLoading(false)
          return
        }

        console.log("[v0] Password found, deriving encryption key...")

        // Get or generate salt
        let saltBase64 = localStorage.getItem("_salt")
        let salt: Uint8Array

        if (!saltBase64) {
          console.log("[v0] Generating new salt...")
          // First time - generate and store salt
          salt = generateSalt()
          saltBase64 = uint8ArrayToBase64(salt)
          localStorage.setItem("_salt", saltBase64)
        } else {
          console.log("[v0] Using existing salt")
          salt = base64ToUint8Array(saltBase64)
        }

        // Derive encryption key
        const key = await deriveKey(password, salt)
        setEncryptionKey(key)
        console.log("[v0] Encryption key derived successfully")

        // Keep password in sessionStorage for the session
        // It will be cleared on logout or when browser tab closes
      } catch (error) {
        console.error("[v0] Failed to initialize encryption key:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeKey()
  }, [])

  return { encryptionKey, isLoading }
}
