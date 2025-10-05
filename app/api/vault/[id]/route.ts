import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// PUT - Update a vault item
export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

    const updateData = {
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
      updatedAt: new Date(),
    }

    const result = await db.collection("vaultItems").findOneAndUpdate(
      {
        _id: new ObjectId(params.id),
        userId: session.user.id,
      },
      { $set: updateData },
      { returnDocument: "after" },
    )

    if (!result) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Failed to update vault item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete a vault item
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    const result = await db.collection("vaultItems").deleteOne({
      _id: new ObjectId(params.id),
      userId: session.user.id,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Item deleted successfully" })
  } catch (error) {
    console.error("[v0] Failed to delete vault item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
