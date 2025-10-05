import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"

// GET - Fetch all vault items for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    const items = await db.collection("vaultItems").find({ userId: session.user.id }).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(items)
  } catch (error) {
    console.error("[v0] Failed to fetch vault items:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create a new vault item
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      encryptedTitle,
      ivTitle,
      encryptedUsername,
      ivUsername,
      encryptedPassword,
      ivPassword,
      encryptedUrl,
      ivUrl,
      encryptedNotes,
      ivNotes,
    } = body

    if (!encryptedTitle || !ivTitle) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    const now = new Date()
    const item = {
      userId: session.user.id,
      encryptedTitle,
      ivTitle,
      encryptedUsername: encryptedUsername || "",
      ivUsername: ivUsername || "",
      encryptedPassword: encryptedPassword || "",
      ivPassword: ivPassword || "",
      encryptedUrl: encryptedUrl || "",
      ivUrl: ivUrl || "",
      encryptedNotes: encryptedNotes || "",
      ivNotes: ivNotes || "",
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection("vaultItems").insertOne(item)

    return NextResponse.json({ _id: result.insertedId, ...item }, { status: 201 })
  } catch (error) {
    console.error("[v0] Failed to create vault item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
