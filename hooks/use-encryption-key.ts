"use client"

import { useState, useEffect } from "react"
import { deriveKey, generateSalt, uint8ArrayToBase64, base64ToUint8Array } from "@/lib/crypto"

export function useEncryptionKey() {
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeKey = async () => {
      try {
        // Get password from session storage (set during login)
        const password = sessionStorage.getItem("_temp_pwd")

        if (!password) {
          console.error("[v0] No password found in session")
          setIsLoading(false)
          return
        }

        // Get or generate salt
        let saltBase64 = localStorage.getItem("_salt")
        let salt: Uint8Array

        if (!saltBase64) {
          // First time - generate and store salt
          salt = generateSalt()
          saltBase64 = uint8ArrayToBase64(salt)
          localStorage.setItem("_salt", saltBase64)
        } else {
          salt = base64ToUint8Array(saltBase64)
        }

        // Derive encryption key
        const key = await deriveKey(password, salt)
        setEncryptionKey(key)

        // Clear password from session storage for security
        sessionStorage.removeItem("_temp_pwd")
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
