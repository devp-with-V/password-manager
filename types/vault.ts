export interface VaultItem {
  _id?: string
  userId: string
  encryptedTitle: string
  encryptedUsername: string
  encryptedPassword: string
  encryptedUrl: string
  encryptedNotes: string
  ivTitle: string
  ivUsername: string
  ivPassword: string
  ivUrl: string
  ivNotes: string
  createdAt: Date
  updatedAt: Date
}

export interface DecryptedVaultItem {
  _id?: string
  title: string
  username: string
  password: string
  url: string
  notes: string
  createdAt: Date
  updatedAt: Date
}
