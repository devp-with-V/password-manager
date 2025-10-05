/**
 * Client-side encryption utilities using Web Crypto API
 * All encryption happens in the browser - server never sees plaintext
 */

const PBKDF2_ITERATIONS = 100000
const SALT_LENGTH = 16
const IV_LENGTH = 12

/**
 * Derive an encryption key from user password using PBKDF2
 */
export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordKey = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveBits",
    "deriveKey",
  ])

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  )
}

/**
 * Encrypt data using AES-GCM
 */
export async function encrypt(data: string, key: CryptoKey): Promise<{ encrypted: string; iv: string }> {
  try {
    const encoder = new TextEncoder()
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

    const encryptedData = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(data))

    console.log("[v0] Encrypted data successfully")
    return {
      encrypted: arrayBufferToBase64(encryptedData),
      iv: arrayBufferToBase64(iv),
    }
  } catch (error) {
    console.error("[v0] Encryption failed:", error)
    throw error
  }
}

/**
 * Decrypt data using AES-GCM
 */
export async function decrypt(encryptedData: string, iv: string, key: CryptoKey): Promise<string> {
  try {
    const decoder = new TextDecoder()
    const decryptedData = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToArrayBuffer(iv) },
      key,
      base64ToArrayBuffer(encryptedData),
    )

    return decoder.decode(decryptedData)
  } catch (error) {
    console.error("[v0] Decryption failed:", error)
    throw error
  }
}

/**
 * Generate a random salt for key derivation
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
}

/**
 * Convert ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Convert Base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * Convert Uint8Array to Base64 string
 */
export function uint8ArrayToBase64(array: Uint8Array): string {
  return arrayBufferToBase64(array.buffer)
}

/**
 * Convert Base64 string to Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  return new Uint8Array(base64ToArrayBuffer(base64))
}
