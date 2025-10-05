export interface PasswordOptions {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeAmbiguous: boolean
}

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz"
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const NUMBERS = "0123456789"
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?"

const AMBIGUOUS_CHARS = "il1Lo0O"

export function generatePassword(options: PasswordOptions): string {
  let charset = ""

  if (options.includeLowercase) charset += LOWERCASE
  if (options.includeUppercase) charset += UPPERCASE
  if (options.includeNumbers) charset += NUMBERS
  if (options.includeSymbols) charset += SYMBOLS

  if (!charset) {
    throw new Error("At least one character type must be selected")
  }

  // Remove ambiguous characters if requested
  if (options.excludeAmbiguous) {
    charset = charset
      .split("")
      .filter((char) => !AMBIGUOUS_CHARS.includes(char))
      .join("")
  }

  // Use crypto.getRandomValues for cryptographically secure random generation
  const password = Array.from(crypto.getRandomValues(new Uint32Array(options.length)))
    .map((x) => charset[x % charset.length])
    .join("")

  return password
}

export function calculatePasswordStrength(password: string): {
  score: number
  label: string
  color: string
} {
  let score = 0

  // Length
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1

  // Character variety
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1

  // Normalize to 0-100
  const normalizedScore = Math.min(100, (score / 7) * 100)

  let label = "Weak"
  let color = "text-destructive"

  if (normalizedScore >= 80) {
    label = "Strong"
    color = "text-green-500"
  } else if (normalizedScore >= 60) {
    label = "Good"
    color = "text-yellow-500"
  } else if (normalizedScore >= 40) {
    label = "Fair"
    color = "text-orange-500"
  }

  return { score: normalizedScore, label, color }
}
