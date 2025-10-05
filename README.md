# SecureVault - Privacy-First Password Manager

A privacy-first password manager MVP built with Next.js 14, TypeScript, and MongoDB featuring client-side encryption and zero-knowledge architecture.

## Features

- **Client-Side Encryption**: All sensitive data is encrypted in the browser using Web Crypto API (AES-GCM with PBKDF2-derived keys)
- **Zero-Knowledge Architecture**: Server never sees plaintext passwords or vault data
- **Secure Authentication**: Email/password authentication with bcrypt hashing
- **Password Generator**: Generate strong passwords with customizable options
- **Secure Vault**: Store and manage passwords, usernames, URLs, and notes
- **Auto-Clear**: Copied passwords automatically clear after 15 seconds
- **Search & Filter**: Quickly find vault entries by title or URL
- **Dark Mode**: System-preference aware dark mode support

## Security Architecture

### Encryption

- **Algorithm**: AES-GCM (256-bit)
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Salt**: Randomly generated 16-byte salt per user
- **IV**: Unique 12-byte initialization vector per encrypted field

### How It Works

1. User signs up/logs in with email and password
2. Password is hashed with bcrypt (12 rounds) and stored in MongoDB
3. On login, user's password is temporarily stored in sessionStorage
4. Encryption key is derived from password using PBKDF2 + user's salt
5. All vault data is encrypted field-by-field before sending to server
6. Server stores only encrypted blobs - never sees plaintext
7. On logout, encryption key and salt are cleared from memory

### Important Security Notes

- **Server never sees plaintext**: All encryption/decryption happens client-side
- **No localStorage for secrets**: Encryption key exists only in memory during session
- **Individual field encryption**: Each field has its own IV for maximum security
- **Password-derived keys**: Encryption key is derived from user's master password

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database (local or cloud)

### Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/securevault
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/securevault

# NextAuth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-secret-key-here

# NextAuth URL (for production)
NEXTAUTH_URL=http://localhost:3000
\`\`\`

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables (see above)

4. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000)

### Database Setup

The app will automatically create the necessary collections in MongoDB:
- `users` - User accounts with hashed passwords
- `vaultItems` - Encrypted vault entries

No manual database setup required!

## Usage

1. **Sign Up**: Create an account with email and password (min 8 characters)
2. **Sign In**: Log in to access your encrypted vault
3. **Add Entry**: Click "Add Entry" to create a new vault item
4. **Generate Password**: Use the built-in generator with customizable options
5. **Search**: Filter entries by title or URL
6. **Copy**: Click copy icons to copy credentials (auto-clears after 15s)
7. **Edit/Delete**: Manage your vault entries as needed

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **Encryption**: Web Crypto API (built-in)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui

## Security Best Practices

- Never share your master password
- Use a strong, unique master password
- Enable 2FA on your MongoDB account
- Use environment variables for all secrets
- Deploy with HTTPS in production
- Regularly backup your MongoDB database

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your deployment platform:
- `MONGODB_URI` - Your MongoDB connection string
- `NEXTAUTH_SECRET` - Secure random string
- `NEXTAUTH_URL` - Your production URL

## License

MIT

## Disclaimer

This is an MVP for educational purposes. For production use, consider additional security measures such as:
- Two-factor authentication
- Password strength requirements
- Rate limiting
- Security audits
- Backup and recovery mechanisms
